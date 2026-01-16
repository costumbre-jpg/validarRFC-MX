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

export async function PUT(request: NextRequest) {
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

    const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let user = null;
    let authError: any = null;
    if (jwt) {
      const adminRes = await supabaseAdmin.auth.getUser(jwt);
      if (adminRes.data?.user) {
        user = adminRes.data.user;
      } else {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user ?? null;
        authError = adminRes.error || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user ?? null;
      authError = userRes.error;
    }

    if (authError || !user) {
      return NextResponse.json(
        { error: "Usuario no autenticado", detail: authError?.message },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { keyId, name, is_active } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: "ID de API Key requerido" },
        { status: 400 }
      );
    }

    // Verificar que la API Key pertenezca al usuario
    const { data: apiKeyData, error: keyError } = await supabaseAdmin
      .from("api_keys")
      .select("id, user_id")
      .eq("id", keyId)
      .eq("user_id", user.id)
      .single();

    if (keyError || !apiKeyData) {
      return NextResponse.json(
        { error: "API Key no encontrada o no tienes permisos" },
        { status: 404 }
      );
    }

    // Construir objeto de actualización
    const updateData: { name?: string; is_active?: boolean } = {};
    
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        return NextResponse.json(
          { error: "El nombre no puede estar vacío" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (is_active !== undefined) {
      if (typeof is_active !== "boolean") {
        return NextResponse.json(
          { error: "is_active debe ser un booleano" },
          { status: 400 }
        );
      }
      updateData.is_active = is_active;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "Debes proporcionar al menos un campo para actualizar (name o is_active)" },
        { status: 400 }
      );
    }

    // Actualizar API Key
    const { error: updateError } = await supabaseAdmin
      .from("api_keys")
      .update(updateData)
      .eq("id", keyId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Error actualizando API key:", updateError);
      return NextResponse.json(
        { error: "Error al actualizar API Key", detail: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error in update API key route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

