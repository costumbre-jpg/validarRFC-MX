import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

// GET: obtener settings de white label
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: settings, error } = await supabase
      .from("white_label_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      settings || {
        brand_name: "Tu Marca",
        custom_logo_url: null,
        primary_color: "#2F7E7A",
        secondary_color: "#1F5D59",
        hide_maflipp_brand: true,
      }
    );
  } catch (error: any) {
    console.error("Error obteniendo white label:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// POST: guardar settings (solo Business)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

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

    const body = await request.json();
    const {
      brand_name,
      custom_logo_url,
      primary_color,
      secondary_color,
      hide_maflipp_brand,
    } = body;

    if (brand_name && typeof brand_name !== "string") {
      return NextResponse.json(
        { error: "brand_name debe ser texto" },
        { status: 400 }
      );
    }

    const payload = {
      user_id: user.id,
      brand_name: brand_name?.slice(0, 80) || "Tu Marca",
      custom_logo_url: custom_logo_url || null,
      primary_color: primary_color || "#2F7E7A",
      secondary_color: secondary_color || "#1F5D59",
      hide_maflipp_brand:
        typeof hide_maflipp_brand === "boolean" ? hide_maflipp_brand : true,
    };

    const { data, error } = await supabase
      .from("white_label_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error guardando white label:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, settings: data });
  } catch (error: any) {
    console.error("Error guardando white label:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

