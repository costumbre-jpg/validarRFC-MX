import { NextRequest, NextResponse } from "next/server";
import { validateRFC, normalizeRFC, isValidRFCFormatStrict } from "@/lib/rfc";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

// Rate limiting para prevenir abuso: 1 request permanente por IP (24 horas)
const DEMO_LIMIT_PER_IP = 1;
const DEMO_WINDOW_HOURS = 24;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar que NO esté autenticado (usuarios autenticados deben usar el dashboard)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          message: "Ya tienes una cuenta. Por favor usa el dashboard para validar RFCs.",
          demoLimitReached: true,
        },
        { status: 403 }
      );
    }

    // 2. Obtener IP del cliente para rate limiting permanente
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || 
               request.headers.get("x-real-ip") || 
               "unknown";

    // 3. Rate limiting: solo 1 validación demo por IP (válido por 24 horas)
    const rate = await rateLimit({
      key: `demo-validate:${ip}`,
      limit: DEMO_LIMIT_PER_IP,
      windowSeconds: DEMO_WINDOW_HOURS * 3600, // 24 horas en segundos
      fallbackMap: rateLimitMap,
    });

    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          message: "Ya has usado tu validación demo. Regístrate gratis para obtener 10 validaciones/mes.",
          demoLimitReached: true,
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": DEMO_LIMIT_PER_IP.toString(),
            "X-RateLimit-Remaining": "0",
            "Retry-After": rate.resetSeconds.toString(),
          },
        }
      );
    }

    // 3. Parsear body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
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
          message: "RFC es requerido",
        },
        { status: 400 }
      );
    }

    // 4. Formatear y validar RFC
    const formattedRFC = normalizeRFC(rfc);

    if (!isValidRFCFormatStrict(formattedRFC)) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: formattedRFC,
          message: "Formato de RFC inválido. Debe tener 12 o 13 caracteres alfanuméricos.",
        },
        { status: 400 }
      );
    }

    // 5. Validar RFC con SAT
    const satResult = await validateRFC(formattedRFC, {
      forceRefresh: forceRefresh === true,
    });

    return NextResponse.json(
      {
        success: satResult.success,
        valid: satResult.valid,
        rfc: formattedRFC,
        message: satResult.message,
        source: satResult.source,
        responseTime: satResult.responseTime,
        cached: satResult.cached,
        name: satResult.name,
        regime: satResult.regime,
        startDate: satResult.startDate,
        demoLimitReached: false,
      },
      {
        status: satResult.success ? 200 : 502,
        headers: {
          "X-RateLimit-Limit": DEMO_LIMIT_PER_IP.toString(),
          "X-RateLimit-Remaining": "0", // Después de esta validación, ya no quedan más
        },
      }
    );
  } catch (error: any) {
    console.error("Error in demo validate route:", error);
    return NextResponse.json(
      {
        success: false,
        valid: false,
        rfc: "",
        message: error?.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

