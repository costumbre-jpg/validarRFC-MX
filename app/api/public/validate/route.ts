import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { hashApiKey, isValidApiKeyFormat } from "@/lib/api-keys";

const PRICE_PER_QUERY = 0.10; // $0.10 MXN por consulta
const RATE_LIMIT_PER_MINUTE = 60; // 60 requests por minuto

// Rate limiting: Map simple en memoria
// En producción, usar Redis o similar
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}, 5 * 60 * 1000);

function checkRateLimit(apiKeyId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const key = `api_${apiKeyId}`;
  const limit = rateLimitMap.get(key);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - 1 };
  }

  if (limit.count >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  limit.count++;
  rateLimitMap.set(key, limit);
  return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - limit.count };
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
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`SAT API returned status ${response.status}`);
    }

    const html = await response.text();
    const isValid =
      html.includes("Registro activo") ||
      html.includes("vivo") ||
      !html.includes("No existe");

    return { valid: isValid, source: "sat" };
  } catch (error: any) {
    return {
      valid: null,
      source: "error",
      error: error?.message || "Error desconocido al consultar SAT",
    };
  }
}

function isValidRFCFormat(rfc: string): boolean {
  const rfcRegex = /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;
  return rfcRegex.test(rfc.toUpperCase().trim());
}

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
      .select("id, user_id, balance, is_active, expires_at, total_used")
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

    // 6. Verificar saldo
    if (apiKeyData.balance < PRICE_PER_QUERY) {
      return NextResponse.json(
        {
          success: false,
          valid: false,
          rfc: "",
          remaining: 0,
          message: `Saldo insuficiente. Se requiere $${PRICE_PER_QUERY} MXN por consulta. Saldo actual: $${apiKeyData.balance} MXN`,
        },
        { status: 402 }
      );
    }

    // 7. Rate limiting
    const rateLimit = checkRateLimit(apiKeyData.id);
    if (!rateLimit.allowed) {
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
            "Retry-After": "60",
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

    const { rfc } = body;

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
    const formattedRFC = rfc.trim().toUpperCase().replace(/[-\s]/g, "");

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

    // 10. Consultar SAT
    const startTime = performance.now();
    const satResult = await validateRFCWithSAT(formattedRFC);
    const responseTime = performance.now() - startTime;

    const isValid = satResult.valid === true;

    // 11. Descontar saldo y registrar uso
    const newBalance = apiKeyData.balance - PRICE_PER_QUERY;

    await supabase
      .from("api_keys")
      .update({
        balance: newBalance,
        total_used: (apiKeyData.total_used || 0) + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq("id", apiKeyData.id);

    // Registrar en logs
    await supabase.from("api_usage_logs").insert({
      api_key_id: apiKeyData.id,
      rfc: formattedRFC,
      is_valid: isValid,
      response_time: responseTime,
      cost: PRICE_PER_QUERY,
    });

    return NextResponse.json(
      {
        success: true,
        valid: isValid,
        rfc: formattedRFC,
        remaining: Math.max(0, Math.floor(newBalance / PRICE_PER_QUERY)),
        message: isValid
          ? "RFC válido"
          : satResult.error
          ? "Error al consultar SAT. RFC no pudo ser verificado."
          : "RFC no existe en el SAT",
        source: satResult.source,
        responseTime: Math.round(responseTime),
        balance: parseFloat(newBalance.toFixed(2)),
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": RATE_LIMIT_PER_MINUTE.toString(),
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
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
      message: "ValidaRFC.mx Public API",
      version: "1.0.0",
      endpoint: "/api/public/validate",
      method: "POST",
      authentication: "X-API-Key header",
      pricing: {
        pricePerQuery: PRICE_PER_QUERY,
        currency: "MXN",
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

