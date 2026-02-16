import { NextResponse, type NextRequest } from "next/server";
import { getAuthTokenFromRequest } from "@/lib/jwt-utils";

// Rutas que requieren autenticación
const PROTECTED_ROUTES = [
  "/dashboard",
  "/api/validate",
  "/api/validations",
  "/api/branding",
  "/api/team",
  "/api/profile",
  "/api/subscription",
  "/api/alerts",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Check if this is a protected route
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  if (isProtected) {
    const token = getAuthTokenFromRequest(request);
    if (!token) {
      // For API routes, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { success: false, error: "No autenticado" },
          { status: 401 }
        );
      }
      
      // For pages, redirect to login
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

