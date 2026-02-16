import { NextRequest } from "next/server";

/**
 * Extrae JWT en formato array JSON o string
 */
export const extractJwtFromCookie = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  if (raw.trim().startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr[0]) {
        return arr[0] as string;
      }
    } catch {
      // ignore parse error
    }
  }
  return raw;
};

/**
 * Obtiene el JWT del header Authorization o cookies
 */
export const getAuthTokenFromRequest = (request: NextRequest): string | undefined => {
  // 1. Intenta obtener del header Authorization
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.replace("Bearer ", "");
  }

  // 2. Buscar en cookies estándar conocidas
  const AUTH_COOKIE_NAMES = ["sb-access-token", "supabase-auth-token", "sb:token"];
  for (const name of AUTH_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    const token = extractJwtFromCookie(value);
    if (token) return token;
  }

  // 3. Buscar cookie de sesión de Supabase generada dinámicamente
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
    const baseName = `sb-${projectRef}-auth-token`;

    // Cookie sin fragmentar
    const direct = request.cookies.get(baseName)?.value;
    if (direct) return direct;

    // Cookies fragmentadas: sb-<ref>-auth-token.0, .1, ...
    const chunks = request.cookies
      .getAll()
      .filter((c) => c.name === baseName || c.name.startsWith(`${baseName}.`))
      .sort((a, b) => a.name.localeCompare(b.name));

    if (chunks.length > 0) {
      const combined = chunks.map((c) => c.value).join("");
      return combined || undefined;
    }
  }

  return undefined;
};
