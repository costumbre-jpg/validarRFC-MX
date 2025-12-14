import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
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
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email requerido" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: "Formato de email inválido" },
        { status: 400 }
      );
    }

    const newEmail = email.trim().toLowerCase();

    // Verificar que el email sea diferente al actual
    if (newEmail === user.email) {
      return NextResponse.json(
        { error: "El nuevo email debe ser diferente al actual" },
        { status: 400 }
      );
    }

    // Actualizar email usando Supabase Auth
    // Esto enviará un email de confirmación al nuevo correo
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (updateError) {
      console.error("Error actualizando email:", updateError);
      
      // Manejar errores específicos
      if (updateError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Este email ya está registrado en otra cuenta" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: updateError.message || "Error al actualizar email" },
        { status: 500 }
      );
    }

    // Actualizar también en la tabla users si existe
    const { error: dbError } = await supabase
      .from("users")
      .update({ email: newEmail })
      .eq("id", user.id);

    // No fallar si hay error en la tabla users (puede que no exista aún)
    if (dbError) {
      console.warn("Error actualizando email en tabla users:", dbError);
    }

    return NextResponse.json({
      success: true,
      message: "Se ha enviado un email de confirmación al nuevo correo. Por favor verifica tu nuevo email para completar el cambio.",
      requiresVerification: true,
    });
  } catch (error: any) {
    console.error("Error en update email:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

