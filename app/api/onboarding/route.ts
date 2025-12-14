import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlan, type PlanId } from "@/lib/plans";

const sanitize = (value: any, max = 500) =>
  typeof value === "string" ? value.slice(0, max).trim() : null;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(_request: NextRequest) {
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

    const { data, error } = await supabase
      .from("onboarding_requests")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      planId,
      onboarding: data || null,
    });
  } catch (error) {
    console.error("Error obteniendo onboarding:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

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

    if (planId !== "business" || !plan.features.other?.includes("Onboarding personalizado")) {
      return NextResponse.json(
        { error: "Onboarding personalizado disponible solo para plan Business" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const payload = {
      user_id: user.id,
      company_name: sanitize(body.company_name, 120),
      industry: sanitize(body.industry, 120),
      team_size: sanitize(body.team_size, 80),
      use_cases: sanitize(body.use_cases, 800),
      data_sources: sanitize(body.data_sources, 800),
      integration_preferences: sanitize(body.integration_preferences, 800),
      webhook_url: sanitize(body.webhook_url, 240),
      sandbox: Boolean(body.sandbox),
      contact_name: sanitize(body.contact_name, 120),
      contact_email: sanitize(body.contact_email, 200),
      status: sanitize(body.status, 40) || "pendiente",
      notes: sanitize(body.notes, 1000),
      updated_at: new Date().toISOString(),
    };

    if (payload.contact_email && !emailRegex.test(payload.contact_email)) {
      return NextResponse.json(
        { error: "Email de contacto inválido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("onboarding_requests")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error guardando onboarding:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, onboarding: data });
  } catch (error) {
    console.error("Error guardando onboarding:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

