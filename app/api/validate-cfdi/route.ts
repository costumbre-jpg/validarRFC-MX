import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

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

    return NextResponse.json({
      error: "Validación CFDI no disponible por ahora. Requiere proveedor PAC/SAT.",
      code: "CFDI_NOT_IMPLEMENTED",
    }, { status: 501 });
  } catch (error: any) {
    console.error("Error validando CFDI:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

