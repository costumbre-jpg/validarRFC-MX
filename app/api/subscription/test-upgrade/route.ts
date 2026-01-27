import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ALLOWED_PLANS = ["free", "pro", "business"];

export async function POST(request: NextRequest) {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_TEST_UPGRADE !== "true"
    ) {
      return NextResponse.json(
        { error: "Endpoint deshabilitado" },
        { status: 404 }
      );
    }

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

    const body = await request.json();
    const plan = body?.planId || body?.plan;

    if (!plan || !ALLOWED_PLANS.includes(plan)) {
      return NextResponse.json(
        { error: `Plan inválido. Usa uno de: ${ALLOWED_PLANS.join(", ")}` },
        { status: 400 }
      );
    }

    type CookieSetOptions = Parameters<NextResponse["cookies"]["set"]>[2];

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

    // Si el plan es "free", eliminar todas las suscripciones y actualizar a free
    if (plan === "free") {
      // Eliminar todas las suscripciones de test-upgrade
      await supabase
        .from("subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("stripe_subscription_id", "test-upgrade");

      // Actualizar subscription_status a free
      const { error: updateError } = await supabase
        .from("users")
        .update({ subscription_status: "free" })
        .eq("id", user.id);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message || "No se pudo cambiar al plan gratis" },
          { status: 500, headers: response.headers }
        );
      }

      return NextResponse.json(
        {
          success: true,
          plan: "free",
          message: "Plan Gratis activado correctamente.",
        },
        { status: 200, headers: response.headers }
      );
    }

    // Para planes Pro/Business: actualizar users.subscription_status
    const { error: updateError } = await supabase
      .from("users")
      .update({ subscription_status: plan })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "No se pudo actualizar el plan" },
        { status: 500, headers: response.headers }
      );
    }

    // Crear/actualizar registro de subscriptions con estado activo (mock)
    // Nota: la tabla no tiene unique constraint en user_id; evitamos onConflict y hacemos upsert manual
    await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", user.id)
      .eq("stripe_subscription_id", "test-upgrade");

    const { error: insertError } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        stripe_subscription_id: "test-upgrade",
        plan,
        status: "active",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message || "No se pudo registrar la suscripción" },
        { status: 500, headers: response.headers }
      );
    }

    return NextResponse.json(
      {
        success: true,
        plan,
        message: `Plan ${plan.toUpperCase()} activado correctamente.`,
      },
      { status: 200, headers: response.headers }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}


