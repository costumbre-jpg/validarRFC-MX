import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getPlan, type PlanId } from "@/lib/plans";

type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

export const runtime = "nodejs";

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

// GET: obtener settings de white label
export async function GET(request: NextRequest) {
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

    // Verificar que el usuario tenga plan Business
    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    const planId = (userData?.subscription_status || "free") as PlanId;
    const plan = getPlan(planId);

    if (!plan.features.whiteLabel) {
      // Si no es Business, devolver defaults (no error, para que el layout no falle)
      return NextResponse.json(
        {
          brand_name: "Tu Marca",
          custom_logo_url: null,
          primary_color: "#2F7E7A",
          secondary_color: "#1F5D59",
          hide_maflipp_brand: true,
        },
        { status: 200, headers: response.headers }
      );
    }

    // Cada empresa mantiene su propio branding, incluso si está en un equipo
    const { data: settings, error } = await supabaseAdmin
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
      },
      { status: 200, headers: response.headers }
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

    if (!plan.features.whiteLabel) {
      return NextResponse.json(
        { error: "White label disponible solo para plan Business" },
        { status: 403 }
      );
    }

    // Cada empresa puede editar su propio branding, incluso si está en un equipo

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

    const { data, error } = await supabaseAdmin
      .from("white_label_settings")
      .upsert(payload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error guardando white label:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, settings: data },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    console.error("Error guardando white label:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

