import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = ["sb-access-token", "supabase-auth-token", "sb:token"];

const extractJwtFromCookie = (raw?: string) => {
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

const getAuthToken = (request: NextRequest) => {
  // 1) Buscar cookies estándar conocidas
  for (const name of AUTH_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    const token = extractJwtFromCookie(value);
    if (token) return token;
  }

  // 2) Buscar cookie de sesión de Supabase generada por set-cookie (`sb-<projectRef>-auth-token`)
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

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = getAuthToken(request);
    if (!token) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set(
        "redirect",
        `${pathname}${search || ""}`
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

