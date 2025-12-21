import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { getPlanValidationLimit, type PlanId } from "@/lib/plans";
import { validateRFC, normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";
import { rateLimit } from "@/lib/rate-limit";

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests por minuto
const RATE_LIMIT_WINDOW_SECONDS = 60;

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: "Usuario no autenticado",
        },
        { status: 401 }
      );
    }

    // 2. Parsear body
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

    // 3. Validar que RFC esté presente
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

    // 4. Limpiar y formatear RFC
    const formattedRFC = normalizeRFC(rfc);

    // 5. Validar formato RFC
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

    // 6. Rate limiting
    const rate = await rateLimit({
      key: `validate:${user.id}`,
      limit: RATE_LIMIT,
      windowSeconds: RATE_LIMIT_WINDOW_SECONDS,
      fallbackMap: rateLimitMap,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: 0,
          message: "Límite de solicitudes excedido. Intenta de nuevo en un minuto.",
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": rate.resetSeconds.toString(),
          },
        }
      );
    }

    // 7. Verificar límite mensual del usuario
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("subscription_status, rfc_queries_this_month")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: 0,
          message: "Error al verificar límite de usuario",
        },
        { status: 500 }
      );
    }

    const plan = (userData?.subscription_status || "free") as PlanId;
    const planLimit = getPlanValidationLimit(plan);
    const queriesThisMonth = userData?.rfc_queries_this_month || 0;

    if (planLimit !== -1 && queriesThisMonth >= planLimit) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          remaining: 0,
          message: `Has alcanzado el límite de ${planLimit} validaciones este mes. Mejora tu plan para obtener más.`,
        },
        { status: 403 }
      );
    }

    // 8. Consultar SAT (con caché)
    const satResult = await validateRFC(formattedRFC, {
      useCache: true,
      forceRefresh,
    });

    // 9. Guardar en base de datos
    const { error: insertError } = await supabase
      .from("validations")
      .insert({
        user_id: user.id,
        rfc: formattedRFC,
        is_valid: satResult.valid,
        response_time: satResult.responseTime,
      });

    if (insertError) {
      console.error("Error saving validation:", insertError);
    }

    // Actualizar contador del usuario
    const { data: currentUserData } = await supabase
      .from("users")
      .select("rfc_queries_this_month")
      .eq("id", user.id)
      .single();

    const newCount = (currentUserData?.rfc_queries_this_month || 0) + 1;

    const { error: updateError } = await supabase
      .from("users")
      .update({ rfc_queries_this_month: newCount })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating user count:", updateError);
    }

    // Obtener límite restante
    const { data: updatedUserData } = await supabase
      .from("users")
      .select("subscription_status, rfc_queries_this_month")
      .eq("id", user.id)
      .single();

    const planAfter = (updatedUserData?.subscription_status || "free") as PlanId;
    const planLimitAfter = getPlanValidationLimit(planAfter);
    const remaining =
      planLimitAfter === -1
        ? -1
        : planLimitAfter - (updatedUserData?.rfc_queries_this_month || 0);

    return NextResponse.json(
      {
        success: satResult.success,
        valid: satResult.valid,
        rfc: formattedRFC,
        remaining: Math.max(0, remaining),
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
          "X-RateLimit-Limit": RATE_LIMIT.toString(),
          "X-RateLimit-Remaining": Math.max(rate.remaining, 0).toString(),
        },
      }
    );
  } catch (error: any) {
    console.error("Error in validate route:", error);

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
      message: "Maflipp API",
      version: "1.0.0",
      endpoint: "/api/validate",
      method: "POST",
      body: {
        rfc: "string (required)",
      },
      rateLimit: {
        limit: RATE_LIMIT,
        window: "1 minute",
      },
    },
    { status: 200 }
  );
}

