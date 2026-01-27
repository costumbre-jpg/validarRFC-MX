import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAMES = [
  "sb-access-token",
  "supabase-auth-token",
  "sb:token",
];

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
  for (const name of AUTH_COOKIE_NAMES) {
    const value = request.cookies.get(name)?.value;
    const token = extractJwtFromCookie(value);
    if (token) return token;
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

