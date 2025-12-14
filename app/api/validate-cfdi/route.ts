import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

/**
 * Validación de CFDI (mock) para plan Business.
 * Nota: Implementación real debería consultar al SAT.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;
    const plan = getPlan(planId);

    if (planId !== "business" || !plan.features.api) {
      return NextResponse.json(
        { error: "CFDI disponible solo en plan Business" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { uuid, rfcEmisor, rfcReceptor, total } = body || {};

    if (!uuid || !rfcEmisor || !rfcReceptor || !total) {
      return NextResponse.json(
        { error: "Faltan campos: uuid, rfcEmisor, rfcReceptor, total" },
        { status: 400 }
      );
    }

    // Mock de validación: siempre válido, con timestamp
    return NextResponse.json({
      success: true,
      valid: true,
      uuid,
      rfcEmisor,
      rfcReceptor,
      total,
      status: "Vigente (mock)",
      validated_at: new Date().toISOString(),
      source: "mock",
    });
  } catch (error: any) {
    console.error("Error validando CFDI:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

