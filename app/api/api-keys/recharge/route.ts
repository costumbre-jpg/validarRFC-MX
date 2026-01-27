import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    if (process.env.ENABLE_API_KEY_RECHARGE !== "true") {
      return NextResponse.json(
        {
          error:
            "Recargas deshabilitadas temporalmente. Activa pagos para habilitar esta función.",
          code: "RECHARGE_DISABLED",
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { apiKeyId, amount } = body;

    if (!apiKeyId || !amount) {
      return NextResponse.json(
        { error: "apiKeyId y amount son requeridos" },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 10) {
      return NextResponse.json(
        { error: "El monto mínimo es $10 MXN" },
        { status: 400 }
      );
    }

    // Verificar que la API Key pertenezca al usuario
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id, balance, user_id")
      .eq("id", apiKeyId)
      .eq("user_id", user.id)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        { error: "API Key no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar saldo
    const newBalance = parseFloat(apiKeyData.balance) + amountNum;

    const { error: updateError } = await supabase
      .from("api_keys")
      .update({ balance: newBalance })
      .eq("id", apiKeyId);

    if (updateError) {
      console.error("Error updating balance:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar saldo" },
        { status: 500 }
      );
    }

    // Nota: habilitar solo con integración de pagos verificada.

    return NextResponse.json({
      success: true,
      newBalance: parseFloat(newBalance.toFixed(2)),
    });
  } catch (error: any) {
    console.error("Error in recharge route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

