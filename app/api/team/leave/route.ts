import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: false }, { status: 200 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Falta SUPABASE_SERVICE_ROLE_KEY en el servidor" },
        { status: 500 }
      );
    }
    const authHeader = request.headers.get("authorization") || "";
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: CookieSetOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
      global: jwt
        ? {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        : undefined,
    });

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey);
    let user = null;
    let authError: any = null;
    if (jwt) {
      const adminRes = await supabaseAdmin.auth.getUser(jwt);
      user = adminRes.data?.user || null;
      authError = adminRes.error;
      if (!user) {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user || null;
        authError = authError || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
      authError = userRes.error;
    }

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "ID de miembro requerido" },
        { status: 400 }
      );
    }

    // Verificar que el miembro pertenezca al usuario actual
    const { data: member, error: memberError } = await supabaseAdmin
      .from("team_members")
      .select("id, user_id, team_owner_id")
      .eq("id", memberId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();

    if (memberError || !member) {
      console.error("Error finding member for leaving:", memberError);
      return NextResponse.json(
        { error: "No se encontró tu membresía en el equipo" },
        { status: 404 }
      );
    }

    // No permitir que el owner salga de su propio equipo
    if (member.team_owner_id === user.id) {
      return NextResponse.json(
        { error: "No puedes salir de tu propio equipo. Debes eliminar el equipo o transferir la propiedad." },
        { status: 400 }
      );
    }

    // Eliminar miembro (salir del equipo)
    const { error: deleteError } = await supabaseAdmin
      .from("team_members")
      .delete()
      .eq("id", memberId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error eliminando membresía:", deleteError);
      return NextResponse.json(
        { error: "Error al salir del equipo", detail: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error en leave team route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

