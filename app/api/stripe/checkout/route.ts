import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    // 1. Verificar autenticación (Bearer o cookies)
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

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {
          // No seteamos cookies en esta ruta
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

    // 2. Parsear body
    const body = await request.json();
    // Compatibilidad: el frontend envía { planId }, pero aceptamos también { plan }
    const plan = body?.planId || body?.plan;
    const billingCycle: "monthly" | "annual" = body?.billingCycle === "annual" ? "annual" : "monthly";

    // Validar plan (soporta pro, business, y planes futuros)
    const validPlans = ["pro", "business", "basic", "enterprise", "api_premium"];
    if (!plan || !validPlans.includes(plan)) {
      return NextResponse.json(
        { error: `Plan inválido. Debe ser uno de: ${validPlans.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Obtener precio del plan desde Stripe
    // Mensual (defaults existentes)
    const priceIdsMonthly: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_ID_PRO || "",
      business: process.env.STRIPE_PRICE_ID_BUSINESS || process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
      // Planes futuros (preparados)
      basic: process.env.STRIPE_PRICE_ID_BASIC || "",
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
      api_premium: process.env.STRIPE_PRICE_ID_API_PREMIUM || "",
    };

    // Anual (nuevas variables)
    const priceIdsAnnual: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || "",
      business: process.env.STRIPE_PRICE_ID_BUSINESS_ANNUAL || process.env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL || "",
      basic: process.env.STRIPE_PRICE_ID_BASIC_ANNUAL || "",
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE_ANNUAL || "",
      api_premium: process.env.STRIPE_PRICE_ID_API_PREMIUM_ANNUAL || "",
    };

    const priceId = billingCycle === "annual" ? priceIdsAnnual[plan] : priceIdsMonthly[plan];

    if (!priceId) {
      return NextResponse.json(
        {
          error:
            billingCycle === "annual"
              ? "Price ID anual no configurado para este plan"
              : "Price ID no configurado para este plan",
        },
        { status: 500 }
      );
    }

    // 4. Obtener o crear customer en Stripe
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = userData?.stripe_customer_id;

    if (!customerId) {
      // Crear customer en Stripe
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          user_id: user.id,
        },
      });

      customerId = customer.id;

      // Guardar customer_id en Supabase
      await supabase
        .from("users")
        .update({ stripe_customer_id: customer.id })
        .eq("id", user.id);
    }

    // 5. Crear sesión de checkout
    // Trial: solo PRO (con tarjeta; Stripe no cobrará hasta terminar el trial)
    const trialDays = plan === "pro" ? 7 : 0;

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: plan,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan,
          billing_cycle: billingCycle,
        },
        ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear sesión de checkout" },
      { status: 500 }
    );
  }
}

