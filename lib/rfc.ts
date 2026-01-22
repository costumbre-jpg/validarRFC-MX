import { formatRFC } from "./utils";
import { getRedis } from "./redis";

type SatResult =
  | {
      valid: boolean;
      source: "sat";
      name?: string;
      regime?: string;
      startDate?: string;
      error?: undefined;
    }
  | { valid: null; source: "error"; error: string };

export interface ValidateRFCResult {
  success: boolean;
  valid: boolean;
  rfc: string;
  source: "sat" | "cache" | "error" | "demo";
  responseTime: number;
  message?: string;
  error?: string;
  cached?: boolean;
  name?: string;
  regime?: string;
  startDate?: string;
}

const RFC_REGEX =
  /^[A-ZÑ&]{3,4}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const satCache = new Map<
  string,
  { result: ValidateRFCResult; expiresAt: number }
>();

export function normalizeRFC(rfc: string): string {
  return formatRFC(rfc);
}

export function isValidRFCFormatStrict(rfc: string): boolean {
  return RFC_REGEX.test(normalizeRFC(rfc));
}

async function validateRFCWithSAT(rfc: string): Promise<SatResult> {
  const url = `https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=${rfc}_`;
  const urlNoUnderscore = `https://siat.sat.gob.mx/app/qr/faces/pages/mobile/validadorqr.jsf?D1=10&D2=1&D3=${rfc}`;
  const urlsToTry = [url, urlNoUnderscore];

  try {
    let lastError: any;
    for (const targetUrl of urlsToTry) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const response = await fetch(targetUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
              "Referer": "https://siat.sat.gob.mx/",
            },
            signal: AbortSignal.timeout(12000),
          });

          if (!response.ok) {
            throw new Error(`SAT respondió ${response.status}`);
          }

          const html = await response.text();
          const lower = html.toLowerCase();

    // Detectar si el RFC no existe o es inválido
    const invalidIndicators = [
      "no existe",
      "incorrecto",
      "no se encuentra",
      "no está registrado",
      "rfc inválido",
      "no encontrado",
      "no localizado",
    ];

    const hasInvalidIndicator = invalidIndicators.some(indicator => 
      lower.includes(indicator)
    );

    // Detectar si el RFC es válido y está activo
    const validIndicators = [
      "registro activo",
      "situación: activa",
      "situación activa",
      "estado: activo",
      "estado activo",
      "contribuyente activo",
      "vivo",
      "activo en el padrón",
    ];

    const hasValidIndicator = validIndicators.some(indicator => 
      lower.includes(indicator)
    );

    // Si tiene indicadores de inválido, es inválido
    if (hasInvalidIndicator) {
      return { valid: false, source: "sat" };
    }

    // Si tiene indicadores de válido, es válido
    if (hasValidIndicator) {
      // Intentar extraer información adicional
      let name: string | undefined;
      let regime: string | undefined;
      let startDate: string | undefined;

      // Extraer nombre/razón social
      const nameMatch = html.match(/<td[^>]*>(?:Razón Social|Nombre)[^<]*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i) ||
                         html.match(/(?:Razón Social|Nombre)[^:]*:\s*([^\n<]+)/i);
      if (nameMatch && nameMatch[1]) {
        name = nameMatch[1].trim();
      }

      // Extraer régimen fiscal
      const regimeMatch = html.match(/<td[^>]*>(?:Régimen|Regimen)[^<]*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i) ||
                            html.match(/(?:Régimen|Regimen)[^:]*:\s*([^\n<]+)/i);
      if (regimeMatch && regimeMatch[1]) {
        regime = regimeMatch[1].trim();
      }

      // Extraer fecha de inicio
      const dateMatch = html.match(/<td[^>]*>(?:Fecha|Inicio)[^<]*<\/td>\s*<td[^>]*>([^<]+)<\/td>/i) ||
                     html.match(/(?:Fecha de Inicio|Fecha Inicio)[^:]*:\s*([^\n<]+)/i);
      if (dateMatch && dateMatch[1]) {
        startDate = dateMatch[1].trim();
      }

      return { 
        valid: true, 
        source: "sat",
        name,
        regime,
        startDate,
      };
    }

          // Si no hay indicadores claros, considerar inválido por seguridad
          // (es mejor ser conservador y marcar como inválido si no hay certeza)
          return { valid: false, source: "sat" };
        } catch (error: any) {
          lastError = error;
          if (attempt < 1) {
            await new Promise((resolve) => setTimeout(resolve, 400));
          }
        }
      }
    }

    throw lastError || new Error("No se pudo conectar con el SAT");

  } catch (error: any) {
    // Si es timeout, dar un error más específico
    if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
      return {
        valid: null,
        source: "error",
        error: "Timeout: El SAT no respondió a tiempo. Por favor intenta de nuevo.",
      };
    }

    return {
      valid: null,
      source: "error",
      error: error?.message?.includes("SAT respondió")
        ? "El SAT respondió con un error. Intenta nuevamente."
        : "No se pudo conectar con el SAT. Intenta nuevamente en unos minutos.",
    };
  }
}

async function getCachedResult(redisKey: string) {
  const redis = getRedis();
  if (!redis) return null;
  const cached = await redis.get<ValidateRFCResult>(redisKey);
  return cached ? { ...cached, cached: true } : null;
}

async function setCachedResult(redisKey: string, value: ValidateRFCResult) {
  const redis = getRedis();
  if (!redis) return;
  await redis.set(redisKey, value, { ex: CACHE_TTL_MS / 1000 });
}

export async function validateRFC(
  rfc: string,
  options: { useCache?: boolean; forceRefresh?: boolean } = {}
): Promise<ValidateRFCResult> {
  const { useCache = true, forceRefresh = false } = options;
  const normalizedRFC = normalizeRFC(rfc);

  if (!isValidRFCFormatStrict(normalizedRFC)) {
    return {
      success: false,
      valid: false,
      rfc: normalizedRFC,
      source: "error",
      responseTime: 0,
      message: "Formato de RFC inválido",
      error: "Formato de RFC inválido",
    };
  }

  // Caché: Redis preferido, fallback a memoria
  const cacheKey = `rfc-cache:${normalizedRFC}`;
  if (useCache && !forceRefresh) {
    const redisCached = await getCachedResult(cacheKey);
    if (redisCached) return redisCached;

    const cached = satCache.get(normalizedRFC);
    const nowMem = Date.now();
    if (cached && cached.expiresAt > nowMem) {
      return { ...cached.result, cached: true };
    }
  }

  const start = performance.now();
  const satResult = await validateRFCWithSAT(normalizedRFC);
  const responseTime = performance.now() - start;

  // Si el SAT falla, intentar devolver un resultado en caché (aunque esté vencido)
  if (satResult.valid === null && useCache) {
    const stale = satCache.get(normalizedRFC);
    if (stale?.result) {
      return {
        ...stale.result,
        cached: true,
        source: "cache",
        success: true,
        message:
          "El SAT no respondió. Mostrando el último resultado disponible en caché.",
      };
    }
  }

  // Si el SAT falla, usar resultados demo para RFCs de ejemplo
  if (satResult.valid === null) {
    const demoMap: Record<string, { name: string; regime: string; startDate: string }> = {
      XAXX010101000: {
        name: "RFC Genérico Público",
        regime: "Régimen General",
        startDate: "01/01/2001",
      },
      GODE561231GR8: {
        name: "Demo Persona Física",
        regime: "Sueldos y Salarios",
        startDate: "31/12/1956",
      },
      COSC8001137NA: {
        name: "Demo Persona Física",
        regime: "Régimen de Incorporación Fiscal",
        startDate: "13/01/1980",
      },
    };
    const demo = demoMap[normalizedRFC];
    if (demo) {
      return {
        success: true,
        valid: true,
        rfc: normalizedRFC,
        source: "demo",
        responseTime: Math.round(responseTime),
        message: "Resultado demo temporal (SAT sin respuesta).",
        name: demo.name,
        regime: demo.regime,
        startDate: demo.startDate,
      };
    }
  }

  // Construir mensaje más descriptivo
  let message: string;
  if (satResult.valid === true) {
    if (satResult.name) {
      message = `RFC válido - ${satResult.name}`;
    } else {
      message = "RFC válido y activo en el padrón del SAT";
    }
  } else if (satResult.valid === false) {
    message = "RFC no existe o no está registrado en el padrón del SAT";
  } else {
    const rawMessage = satResult.error || "Error al consultar SAT";
    const normalized = rawMessage.toLowerCase();
    message =
      normalized.includes("fetch failed") ||
      normalized.includes("enotfound") ||
      normalized.includes("econnreset") ||
      normalized.includes("econnrefused") ||
      normalized.includes("network")
        ? "No se pudo conectar con el SAT. Intenta nuevamente en unos minutos."
        : rawMessage;
  }

  const result: ValidateRFCResult = {
    success: satResult.valid !== null,
    valid: satResult.valid === true,
    rfc: normalizedRFC,
    source: satResult.valid === null ? "error" : "sat",
    responseTime: Math.round(responseTime),
    message,
    error:
      satResult.source === "error"
        ? message
        : undefined,
    name: satResult.source === "sat" ? satResult.name : undefined,
    regime: satResult.source === "sat" ? satResult.regime : undefined,
    startDate: satResult.source === "sat" ? satResult.startDate : undefined,
  };

  // Guardar en caché si hay respuesta
  if (useCache && satResult.valid !== null) {
    const now = Date.now();
    satCache.set(normalizedRFC, {
      result,
      expiresAt: now + CACHE_TTL_MS,
    });
    await setCachedResult(cacheKey, result);
  }

  return result;
}

