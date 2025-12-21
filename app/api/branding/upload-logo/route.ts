import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

export async function POST(request: NextRequest) {
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

    // Verificar que el usuario tenga plan Business
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;
    const plan = getPlan(planId);

    if (!plan.features.whiteLabel) {
      return NextResponse.json(
        { error: "White label disponible solo para plan Business" },
        { status: 403 }
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

    // Validar tipo de archivo (PNG, SVG, JPG)
    const validTypes = ["image/png", "image/svg+xml", "image/jpeg", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no válido. Solo se permiten PNG, SVG o JPG" },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 2MB para logos)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Máximo 2MB" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop();
    const fileName = `logo-${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `branding/${fileName}`;

    // Convertir File a ArrayBuffer para subir
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir a Supabase Storage
    // Nota: Necesitas crear el bucket "branding" en Supabase Storage con políticas públicas
    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true, // Sobrescribir si existe
      });

    if (uploadError) {
      console.error("Error subiendo logo:", uploadError);
      return NextResponse.json(
        { error: uploadError.message || "Error al subir el logo" },
        { status: 500 }
      );
    }

    // Obtener URL pública de la imagen
    const { data: urlData } = supabase.storage
      .from("branding")
      .getPublicUrl(filePath);

    const logoUrl = urlData.publicUrl;

    return NextResponse.json({
      success: true,
      logo_url: logoUrl,
    });
  } catch (error: any) {
    console.error("Error en upload logo:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

