import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateApiKey, hashApiKey, getApiKeyPrefix } from "@/lib/api-keys";

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

    // Verificar que el usuario tenga plan Pro o Enterprise
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const isPro =
      userData?.subscription_status === "pro" ||
      userData?.subscription_status === "enterprise";

    if (!isPro) {
      return NextResponse.json(
        {
          error:
            "Las API Keys están disponibles solo para planes Pro y Empresarial",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    // Generar API Key
    const apiKey = generateApiKey();
    const keyHash = hashApiKey(apiKey);
    const keyPrefix = getApiKeyPrefix(apiKey);

    // Guardar en base de datos
    const { error: insertError } = await supabase.from("api_keys").insert({
      user_id: user.id,
      key_hash: keyHash,
      key_prefix: keyPrefix,
      name: name.trim(),
      balance: 0.0,
    });

    if (insertError) {
      console.error("Error creating API key:", insertError);
      return NextResponse.json(
        { error: "Error al crear API Key" },
        { status: 500 }
      );
    }

    // Retornar API Key (solo se muestra una vez)
    return NextResponse.json({ apiKey });
  } catch (error: any) {
    console.error("Error in create API key route:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

