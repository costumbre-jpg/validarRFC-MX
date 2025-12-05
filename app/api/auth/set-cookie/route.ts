import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { access_token, refresh_token } = await request.json();

    if (!access_token || !refresh_token) {
      return NextResponse.json(
        { error: "Faltan tokens para establecer la sesión" },
        { status: 400 }
      );
    }

    // Crear el valor de la cookie de sesión de Supabase
    const sessionData = JSON.stringify({
      access_token,
      refresh_token,
      token_type: "bearer",
    });

    // Obtener el project ref de la URL de Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const projectRef = supabaseUrl.replace("https://", "").replace(".supabase.co", "");
    
    // Nombre de la cookie de Supabase
    const cookieName = `sb-${projectRef}-auth-token`;

    // Crear respuesta
    const response = NextResponse.json({ success: true });

    // La cookie puede ser muy larga, así que Supabase la divide en chunks
    // Para simplificar, establecemos la cookie completa
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    };

    // Si el valor es muy largo (>4096 bytes), dividir en chunks
    const maxChunkSize = 3500; // Dejamos margen
    if (sessionData.length > maxChunkSize) {
      const chunks = Math.ceil(sessionData.length / maxChunkSize);
      for (let i = 0; i < chunks; i++) {
        const chunk = sessionData.slice(i * maxChunkSize, (i + 1) * maxChunkSize);
        response.cookies.set(`${cookieName}.${i}`, chunk, cookieOptions);
      }
    } else {
      response.cookies.set(cookieName, sessionData, cookieOptions);
    }

    console.log("✅ Cookie de sesión establecida:", cookieName);

    return response;
  } catch (err: any) {
    console.error("Error en set-cookie:", err);
    return NextResponse.json(
      { error: err?.message || "Error al establecer la sesión" },
      { status: 500 }
    );
  }
}

