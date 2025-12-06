import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
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

    // 2. Obtener stripe_customer_id
    const { data: userData } = await supabase
      .from("users")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    if (!userData?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No se encontró customer de Stripe. Debes tener una suscripción activa." },
        { status: 400 }
      );
    }

    // 3. Crear sesión del portal del cliente
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userData.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: error?.message || "Error al crear sesión del portal" },
      { status: 500 }
    );
  }
}

