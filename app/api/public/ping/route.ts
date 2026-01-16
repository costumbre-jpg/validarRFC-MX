import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashApiKey, isValidApiKeyFormat } from "@/lib/api-keys";
import { getPlanApiLimit, type PlanId } from "@/lib/plans";

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      request.headers.get("x-api-key") ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          message: "API Key requerida. Incluye 'X-API-Key' en el header.",
        },
        { status: 401 }
      );
    }

    if (!isValidApiKeyFormat(apiKey)) {
      return NextResponse.json(
        { success: false, message: "Formato de API Key inválido" },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Servidor mal configurado" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const apiKeyHash = hashApiKey(apiKey);

    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id, user_id, is_active, expires_at, api_calls_this_month")
      .eq("key_hash", apiKeyHash)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        { success: false, message: "API Key inválida o no encontrada" },
        { status: 401 }
      );
    }

    if (!apiKeyData.is_active) {
      return NextResponse.json(
        { success: false, message: "API Key desactivada" },
        { status: 403 }
      );
    }

    if (
      apiKeyData.expires_at &&
      new Date(apiKeyData.expires_at) < new Date()
    ) {
      return NextResponse.json(
        { success: false, message: "API Key expirada" },
        { status: 403 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", apiKeyData.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, message: "Error al verificar plan del usuario" },
        { status: 500 }
      );
    }

    const planId = (userData.subscription_status || "free") as PlanId;
    const planLimit = getPlanApiLimit(planId);
    const callsThisMonth = apiKeyData.api_calls_this_month || 0;
    const remaining =
      planLimit === -1 ? -1 : Math.max(0, planLimit - callsThisMonth);

    return NextResponse.json(
      {
        success: true,
        message: "API Key válida",
        plan: planId,
        remaining,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in public ping route:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

