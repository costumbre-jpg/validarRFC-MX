import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    // 1. Verificar autenticación
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

    // 2. Parsear body
    const body = await request.json();
    const { plan } = body;

    if (!plan || (plan !== "pro" && plan !== "enterprise")) {
      return NextResponse.json(
        { error: "Plan inválido. Debe ser 'pro' o 'enterprise'" },
        { status: 400 }
      );
    }

    // 3. Obtener precio del plan desde Stripe
    // En producción, estos deberían ser los Price IDs de tus productos en Stripe
    const priceIds: Record<string, string> = {
      pro: process.env.STRIPE_PRICE_ID_PRO || "",
      enterprise: process.env.STRIPE_PRICE_ID_ENTERPRISE || "",
    };

    const priceId = priceIds[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID no configurado para este plan" },
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
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan,
        },
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

