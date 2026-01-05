import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

export async function POST(request: NextRequest) {
  try {
    // Prepara respuesta para poder adjuntar cookies si Supabase las refresca
    const response = NextResponse.json({ success: false }, { status: 200 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const authHeader = request.headers.get("authorization") || "";
  const jwt = authHeader.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : undefined;

  if (!jwt) {
    return NextResponse.json(
      { error: "Usuario no autenticado" },
      { status: 401 }
    );
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    global: {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    },
    });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(jwt);

    if (!user || authError) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 5MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Convertir File a ArrayBuffer para subir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Supabase Storage
    // Nota: Necesitas crear el bucket "avatars" en Supabase Storage con políticas públicas
    const { data: _uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false, // No sobrescribir si existe
      });

    if (uploadError) {
      console.error("Error subiendo avatar:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Error al subir la imagen" },
        { status: 500 }
      );
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = urlData.publicUrl;

    // Actualizar avatar_url en la tabla users; si no existe fila por RLS, hacer upsert
    const doUpdate = async () => {
      return supabase
        .from("users")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id)
        .select()
        .maybeSingle();
    };

    let { error: updateError } = await doUpdate();

    if (updateError) {
      // Intentar upsert creando la fila si no existe
      const { error: upsertError } = await supabase
        .from("users")
        .upsert(
          {
            id: user.id,
            email: user.email || "",
            avatar_url: avatarUrl,
          },
          { onConflict: "id" }
        )
        .select()
        .maybeSingle();

      if (upsertError) {
        console.error("Error actualizando avatar_url (upsert):", upsertError);
        return NextResponse.json(
          { error: upsertError.message || "Error al subir la imagen" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: true, avatar_url: avatarUrl },
      {
        status: 200,
        headers: response.headers,
      }
    );
  } catch (error: any) {
    console.error("Error en upload avatar:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

