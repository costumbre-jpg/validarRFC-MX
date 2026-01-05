import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

export async function PUT(request: NextRequest) {
  try {
    // Prepara respuesta para propagar cookies si Supabase las refresca
    const response = NextResponse.json({ success: false }, { status: 200 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user || authError) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { full_name, company_name, phone } = body;

    // Validar y sanitizar
    const updates: any = {};
    
    if (full_name !== undefined) {
      if (typeof full_name !== "string") {
        return NextResponse.json(
          { error: "full_name debe ser un texto" },
          { status: 400 }
        );
      }
      const sanitized = full_name.trim().slice(0, 100);
      updates.full_name = sanitized || null;
    }

    if (company_name !== undefined) {
      if (typeof company_name !== "string") {
        return NextResponse.json(
          { error: "company_name debe ser un texto" },
          { status: 400 }
        );
      }
      const sanitized = company_name.trim().slice(0, 100);
      updates.company_name = sanitized || null;
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== "string") {
        return NextResponse.json(
          { error: "phone debe ser un texto o null" },
          { status: 400 }
        );
      }
      if (phone) {
        // Validar formato básico de teléfono (solo números, espacios, guiones, paréntesis, +)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        const sanitized = phone.trim().slice(0, 20);
        if (!phoneRegex.test(sanitized)) {
          return NextResponse.json(
            { error: "Formato de teléfono inválido" },
            { status: 400 }
          );
        }
        updates.phone = sanitized;
      } else {
        updates.phone = null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No se proporcionaron campos para actualizar" },
        { status: 400 }
      );
    }

    // Actualizar en la base de datos
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error);
      return NextResponse.json(
        { error: error.message || "Error al actualizar perfil" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, user: data },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error en update profile:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

