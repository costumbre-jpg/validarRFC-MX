import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function DELETE(request: NextRequest) {
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

    // 1. Verificar si tiene suscripción activa en Stripe
    const { data: userData } = await supabase
      .from("users")
      .select("subscription_status, stripe_customer_id")
      .eq("id", user.id)
      .single();

    // Si tiene suscripción activa, cancelarla en Stripe
    if (userData?.stripe_customer_id) {
      try {
        const stripe = getStripe();

        // Obtener suscripciones activas del cliente
        const subscriptions = await stripe.subscriptions.list({
          customer: userData.stripe_customer_id,
          status: "active",
        });

        // Cancelar todas las suscripciones activas
        for (const subscription of subscriptions.data) {
          await stripe.subscriptions.cancel(subscription.id);
        }
      } catch (stripeError: any) {
        console.error("Error cancelando suscripción en Stripe:", stripeError);
        // Continuar con la eliminación aunque falle Stripe
      }
    }

    // 2. Eliminar datos relacionados (se eliminan automáticamente por CASCADE):
    // - validations (CASCADE)
    // - api_keys (CASCADE)
    // - api_usage_logs (CASCADE)
    // - subscriptions (CASCADE)
    // - email_alerts_preferences (si existe, CASCADE)
    // - team_members (si existe, CASCADE)

    // 3. Eliminar el usuario de la tabla users
    const { error: deleteError } = await supabase
      .from("users")
      .delete()
      .eq("id", user.id);

    if (deleteError) {
      console.error("Error eliminando usuario de users:", deleteError);
      return NextResponse.json(
        { error: "Error al eliminar datos del usuario" },
        { status: 500 }
      );
    }

    // 4. Eliminar el usuario de Supabase Auth usando service role key
    try {
      const supabaseAdmin = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      // Eliminar usuario de Auth (requiere service role key)
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        user.id
      );

      if (authDeleteError) {
        console.error("Error eliminando usuario de Auth:", authDeleteError);
        // Continuar aunque falle, los datos ya se eliminaron
      }
    } catch (authError: any) {
      console.error("Error al eliminar de Auth:", authError);
      // Continuar aunque falle
    }

    return NextResponse.json({
      success: true,
      message: "Cuenta eliminada exitosamente",
    });
  } catch (error: any) {
    console.error("Error en delete account:", error);
    return NextResponse.json(
      { error: error?.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

