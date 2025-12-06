import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting: Map simple en memoria
// En producción, usar Redis o similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests por minuto
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto en milisegundos

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Nueva ventana de tiempo
    rateLimitMap.set(userId, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (userLimit.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  // Incrementar contador
  userLimit.count++;
  rateLimitMap.set(userId, userLimit);
  return { allowed: true, remaining: RATE_LIMIT - userLimit.count };
}

async function validateRFCWithSAT(rfc: string): Promise<{
  valid: boolean | null;
  source: string;
  error?: string;
}> {
  const url = `https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=${rfc}_`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 ValidaRFC.mx",
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`SAT API returned status ${response.status}`);
    }

    const html = await response.text();

    // Buscar indicadores en el HTML
    const isValid =
      html.includes("Registro activo") ||
      html.includes("vivo") ||
      !html.includes("No existe");

    return { valid: isValid, source: "sat" };
  } catch (error: any) {
    // Fallback a base local si SAT falla
    return {
      valid: null,
      source: "error",
      error: error?.message || "Error desconocido al consultar SAT",
    };
  }
}

function isValidRFCFormat(rfc: string): boolean {
  // Regex para validar formato RFC mexicano
  // Formato: 3-4 letras, 6 dígitos (año, mes, día), 2-3 caracteres alfanuméricos, 1 dígito
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;
  return rfcRegex.test(rfc.toUpperCase().trim());
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar autenticación
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Permitir demo sin autenticación (opcional - remover en producción)
    const isDemo = request.headers.get("x-demo-mode") === "true";
    
    if (!user && !isDemo) {
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

    const { rfc } = body;

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
    const formattedRFC = rfc.trim().toUpperCase().replace(/[-\s]/g, "");

    // 5. Validar formato RFC
    if (!isValidRFCFormat(formattedRFC)) {
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

    // 6. Rate limiting (solo si está autenticado)
    if (user) {
      const rateLimit = checkRateLimit(user.id);
      if (!rateLimit.allowed) {
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
              "Retry-After": "60",
            },
          }
        );
      }
    }

    // 7. Verificar límite mensual del usuario (solo si está autenticado)
    if (user) {
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

      const plan = userData?.subscription_status || "free";
      const planLimit =
        plan === "free" ? 5 : plan === "pro" ? 100 : 1000;
      const queriesThisMonth = userData?.rfc_queries_this_month || 0;

      if (queriesThisMonth >= planLimit) {
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
    }

    // 8. Consultar SAT
    const startTime = performance.now();
    const satResult = await validateRFCWithSAT(formattedRFC);
    const responseTime = performance.now() - startTime;

    // 9. Determinar si es válido
    // Si el SAT devuelve error, consideramos como inválido pero guardamos el error
    const isValid = satResult.valid === true;

    // 10. Guardar en base de datos (solo si está autenticado)
    if (user) {
      // Guardar validación
      const { error: insertError } = await supabase
        .from("validations")
        .insert({
          user_id: user.id,
          rfc: formattedRFC,
          is_valid: isValid,
          response_time: responseTime,
        });

      if (insertError) {
        console.error("Error saving validation:", insertError);
        // Continuar aunque falle el guardado
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
        // Continuar aunque falle la actualización
      }

      // Obtener límite restante
      const { data: updatedUserData } = await supabase
        .from("users")
        .select("subscription_status, rfc_queries_this_month")
        .eq("id", user.id)
        .single();

      const plan = updatedUserData?.subscription_status || "free";
      const planLimit =
        plan === "free" ? 5 : plan === "pro" ? 100 : 1000;
      const remaining =
        planLimit - (updatedUserData?.rfc_queries_this_month || 0);

      // Obtener rate limit remaining
      const rateLimit = checkRateLimit(user.id);

      return NextResponse.json(
        {
          success: true,
          valid: isValid,
          rfc: formattedRFC,
          remaining: Math.max(0, remaining),
          message: isValid
            ? "RFC válido"
            : satResult.error
            ? "Error al consultar SAT. RFC no pudo ser verificado."
            : "RFC no existe en el SAT",
          source: satResult.source,
          responseTime: Math.round(responseTime),
        },
        {
          status: 200,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    } else {
      // Modo demo - no guardar en BD
      const rateLimit = checkRateLimit("demo");

      return NextResponse.json(
        {
          success: true,
          valid: isValid,
          rfc: formattedRFC,
          remaining: -1, // -1 indica modo demo
          message: isValid
            ? "RFC válido (demo)"
            : satResult.error
            ? "Error al consultar SAT. RFC no pudo ser verificado (demo)."
            : "RFC no existe en el SAT (demo)",
          source: satResult.source,
          responseTime: Math.round(responseTime),
        },
        {
          status: 200,
          headers: {
            "X-RateLimit-Limit": RATE_LIMIT.toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    }
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
      message: "ValidaRFC.mx API",
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

