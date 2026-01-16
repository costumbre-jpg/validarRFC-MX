import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashApiKey, isValidApiKeyFormat } from "@/lib/api-keys";
import { getPlanApiLimit, type PlanId } from "@/lib/plans";
import { validateRFC, normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";
import { rateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_PER_MINUTE = 60; // 60 requests por minuto
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener API Key del header
    const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "API Key requerida. Incluye 'X-API-Key' en el header.",
        },
        { status: 401 }
      );
    }

    // 2. Validar formato de API Key
    if (!isValidApiKeyFormat(apiKey)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Formato de API Key inválido",
        },
        { status: 401 }
      );
    }

    // 3. Buscar API Key en la base de datos
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const apiKeyHash = hashApiKey(apiKey);
    const { data: apiKeyData, error: keyError } = await supabase
      .from("api_keys")
      .select("id, user_id, is_active, expires_at, total_used, api_calls_this_month")
      .eq("key_hash", apiKeyHash)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "API Key inválida o no encontrada",
        },
        { status: 401 }
      );
    }

    // 4. Verificar que la API Key esté activa
    if (!apiKeyData.is_active) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "API Key desactivada",
        },
        { status: 403 }
      );
    }

    // 5. Verificar expiración
    if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "API Key expirada",
        },
        { status: 403 }
      );
    }

    // 6. Obtener plan del usuario y verificar límite mensual
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", apiKeyData.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Error al verificar plan del usuario",
        },
        { status: 500 }
      );
    }

    const planId = (userData.subscription_status || "free") as PlanId;
    const planApiLimit = getPlanApiLimit(planId);
    const apiCallsThisMonth = apiKeyData.api_calls_this_month || 0;

    // Verificar límite mensual (si planApiLimit es -1, es ilimitado)
    if (planApiLimit !== -1 && apiCallsThisMonth >= planApiLimit) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: `Has alcanzado el límite de ${planApiLimit.toLocaleString()} llamadas API este mes. El límite se reinicia el primer día de cada mes.`,
        },
        { status: 403 }
      );
    }

    // 7. Rate limiting
    const rate = await rateLimit({
      key: `public-validate:${apiKeyData.id}`,
      limit: RATE_LIMIT_PER_MINUTE,
      windowSeconds: 60,
      fallbackMap: rateLimitMap,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Límite de solicitudes excedido. Máximo 60 requests por minuto.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT_PER_MINUTE.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": rate.resetSeconds.toString(),
          },
        }
      );
    }

    // 8. Parsear body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Body JSON inválido",
        },
        { status: 400 }
      );
    }

    const { rfc, forceRefresh = false } = body;

    if (!rfc || typeof rfc !== "string") {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "RFC es requerido",
        },
        { status: 400 }
      );
    }

    // 9. Formatear y validar RFC
    const formattedRFC = normalizeRFC(rfc);

    if (!isValidRFCFormatStrict(formattedRFC)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: 0,
          message: "Formato de RFC inválido",
        },
        { status: 400 }
      );
    }

    // 10. Consultar SAT (con caché)
    const satResult = await validateRFC(formattedRFC, {
      useCache: true,
      forceRefresh,
    });

    // Calcular remainingCalls antes de usarlo
    const remainingCalls = planApiLimit === -1 
      ? -1 // Ilimitado
      : Math.max(0, planApiLimit - apiCallsThisMonth);

    // Si hay un error al consultar SAT, devolver error más claro
    if (satResult.error || satResult.valid === null) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: remainingCalls,
          message: satResult.error || "Error al consultar el SAT. Por favor intenta de nuevo.",
        },
        { status: 502 }
      );
    }

    // 11. Actualizar contador mensual y registrar uso
    const newApiCallsThisMonth = (apiCallsThisMonth || 0) + 1;
    const newRemainingCalls = planApiLimit === -1 
      ? -1 // Ilimitado
      : Math.max(0, planApiLimit - newApiCallsThisMonth);

    // Actualizar contador en api_keys
    await supabase
      .from("api_keys")
      .update({
        api_calls_this_month: newApiCallsThisMonth,
        total_used: (apiKeyData.total_used || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", apiKeyData.id);

    // Actualizar contador en users (para estadísticas)
    const { data: currentUserData } = await supabase
      .from("users")
      .select("api_calls_this_month")
      .eq("id", apiKeyData.user_id)
      .single();

    const newUserApiCalls = (currentUserData?.api_calls_this_month || 0) + 1;
    await supabase
      .from("users")
      .update({
        api_calls_this_month: newUserApiCalls,
      })
      .eq("id", apiKeyData.user_id);

    // Registrar en logs (sin costo, ya que usa límite mensual)
    await supabase.from("api_usage_logs").insert({
      api_key_id: apiKeyData.id,
      rfc: formattedRFC,
      is_valid: satResult.valid,
      response_time: satResult.responseTime,
      cost: 0.0, // Sin costo, usa límite mensual del plan
    });

    return NextResponse.json(
      {
        success: satResult.success,
        valid: satResult.valid,
        rfc: formattedRFC,
        remaining: newRemainingCalls,
        message: satResult.message,
        source: satResult.source,
        responseTime: satResult.responseTime,
        cached: satResult.cached,
        name: satResult.name,
        regime: satResult.regime,
        startDate: satResult.startDate,
      },
      {
        status: satResult.success ? 200 : 502,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_PER_MINUTE.toString(),
          "X-RateLimit-Remaining": Math.max(rate.remaining, 0).toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Error in public validate route:", error);

    return NextResponse.json(
      {
        success: false,
        valid: false,
        rfc: "",
        remaining: 0,
        message: error?.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

// Método GET para información de la API
export async function GET() {
  return NextResponse.json(
    {
      message: "Maflipp Public API",
      version: "1.0.0",
      endpoint: "/api/public/validate",
      method: "POST",
      authentication: "X-API-Key header",
      pricing: {
        model: "monthly_limit",
        description: "Las llamadas API están incluidas en tu plan mensual. Los límites se reinician el primer día de cada mes.",
      },
      rateLimit: {
        limit: RATE_LIMIT_PER_MINUTE,
        window: "1 minute",
      },
      body: {
        rfc: "string (required)",
      },
    },
    { status: 200 }
  );
}

