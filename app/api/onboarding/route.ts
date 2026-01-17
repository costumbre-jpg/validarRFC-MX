import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getPlan, type PlanId } from "@/lib/plans";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

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

const sanitize = (value: any, max = 500) =>
  typeof value === "string" ? value.slice(0, max).trim() : null;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(_request: NextRequest) {
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

    const authHeader = _request.headers.get("authorization") || "";
    let jwt = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : undefined;

    if (!jwt) {
      const cookieToken =
        extractJwtFromCookie(_request.cookies.get("sb-access-token")?.value) ||
        extractJwtFromCookie(_request.cookies.get("supabase-auth-token")?.value) ||
        extractJwtFromCookie(_request.cookies.get("sb:token")?.value);
      jwt = cookieToken || undefined;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return _request.cookies.getAll();
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
      user = adminRes.data?.user || null;
      authError = adminRes.error;
      if (!user) {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user || null;
        authError = authError || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
      authError = userRes.error;
    }

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;

    const { data, error } = await supabaseAdmin
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
      user = adminRes.data?.user || null;
      authError = adminRes.error;
      if (!user) {
        const userRes = await supabase.auth.getUser(jwt);
        user = userRes.data?.user || null;
        authError = authError || userRes.error;
      }
    } else {
      const userRes = await supabase.auth.getUser();
      user = userRes.data?.user || null;
      authError = userRes.error;
    }

    if (!user || authError) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { data: userData } = await supabaseAdmin
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

    const { data, error } = await supabaseAdmin
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

