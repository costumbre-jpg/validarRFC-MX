import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET: Obtener preferencias de alertas del usuario
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Obtener preferencias del usuario
    const { data: preferences, error } = await supabase
      .from("email_alert_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows returned
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Si no existen preferencias, retornar valores por defecto
    if (!preferences) {
      return NextResponse.json({
        alerts_enabled: true,
        alert_threshold: 80,
      });
    }

    return NextResponse.json({
      alerts_enabled: preferences.alerts_enabled,
      alert_threshold: preferences.alert_threshold,
    });
  } catch (error: any) {
    console.error("Error obteniendo preferencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST/PUT: Guardar o actualizar preferencias de alertas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { alerts_enabled, alert_threshold } = body;

    // Validar datos
    if (typeof alerts_enabled !== "boolean") {
      return NextResponse.json(
        { error: "alerts_enabled debe ser un booleano" },
        { status: 400 }
      );
    }

    if (
      typeof alert_threshold !== "number" ||
      alert_threshold < 50 ||
      alert_threshold > 100
    ) {
      return NextResponse.json(
        { error: "alert_threshold debe ser un número entre 50 y 100" },
        { status: 400 }
      );
    }

    // Insertar o actualizar preferencias (UPSERT)
    const { data, error } = await supabase
      .from("email_alert_preferences")
      .upsert(
        {
          user_id: user.id,
          alerts_enabled,
          alert_threshold,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      )
      .select()
      .single();

    if (error) {
      console.error("Error guardando preferencias:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      preferences: {
        alerts_enabled: data.alerts_enabled,
        alert_threshold: data.alert_threshold,
      },
    });
  } catch (error: any) {
    console.error("Error guardando preferencias:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

