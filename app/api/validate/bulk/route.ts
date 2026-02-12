import { NextRequest, NextResponse } from "next/server";
import { checkBlacklist } from "@/lib/blacklist";
import { validateRFC } from "@/lib/rfc";
import * as XLSX from 'xlsx';



export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Basic authentication check (simplified for now)
        // const authHeader = request.headers.get("Authorization");
        // In a real scenario, we would verify the session using Supabase Auth

        let rfcs: string[] = [];

        // Parse file
        if (file.name.endsWith('.csv')) {
            const text = await file.text();
            rfcs = text.split(/\r?\n/).map(line => line.trim()).filter(line => line && line.length >= 10);
        } else {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) {
                return NextResponse.json({ error: "El archivo Excel no es válido o está vacío." }, { status: 400 });
            }
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as string[][];
            rfcs = jsonData.flat().map(cell => String(cell).trim()).filter(cell => cell && cell.length >= 10);
        }

        // Limit check (Mock)
        if (rfcs.length > 5000) {
            return NextResponse.json({ error: "El archivo excede el límite de 5000 RFCs." }, { status: 400 });
        }

        const results = [];

        // Process RFCs using the validation logic
        // In production, this should be a background job (Queue) for large files
        for (const rfc of rfcs) {
            // 1. Structure Check
            const satResult = await validateRFC(rfc);

            // 2. Blacklist Check
            const blacklistResult = await checkBlacklist(rfc);

            results.push({
                rfc: rfc.toUpperCase(),
                is_valid: satResult.valid,
                blacklist_status: blacklistResult.status,
                description: blacklistResult.description
            });
        }

        // Persist batch results (Optional for now, but recommended)
        // await saveBulkResults(results);

        return NextResponse.json({
            success: true,
            count: results.length,
            results: results
        });

    } catch (error: any) {
        console.error("Bulk validation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
