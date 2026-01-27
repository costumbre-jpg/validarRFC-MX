import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const extractJwtFromCookie = (raw?: string) => {
  if (!raw) return undefined;
  if (raw.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr[0]) {
        return arr[0] as string;
      }
    } catch {
      // ignore parse error
    }
  }
  return raw;
};

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, error: "Falta configuración de Supabase." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    if (!jwt) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(jwt);
    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, error: "No autenticado" },
        { status: 401 }
      );
    }

    const userId = authData.user.id;
    const url = request.nextUrl;
    const scope = url.searchParams.get("scope") || "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const pageSize = Math.min(
      50,
      Math.max(1, parseInt(url.searchParams.get("pageSize") || "10", 10))
    );
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("validations")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (scope === "month") {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      query = query.gte("created_at", startOfMonth.toISOString());
    }

    const { data, count, error } = await query.range(from, to);

    if (error) {
      return NextResponse.json(
        { success: false, error: "Error al cargar validaciones" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
    });
  } catch (error) {
    console.error("Error in /api/validations:", error);
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

