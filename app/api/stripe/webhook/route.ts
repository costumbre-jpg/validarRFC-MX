import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Crear cliente de Supabase con service role key para bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const userId = session.metadata?.user_id;
        const plan = session.metadata?.plan;

        if (!userId || !plan) {
          console.error("Missing user_id or plan in session metadata");
          break;
        }

        // Obtener subscription de Stripe
        const subscriptionId = session.subscription;
        if (!subscriptionId) {
          console.error("No subscription ID in session");
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId as string
        );

        // Actualizar subscription_status en users
        await supabase
          .from("users")
          .update({
            subscription_status: plan,
          })
          .eq("id", userId);

        // Crear o actualizar registro en subscriptions
        const { data: existingSubscription } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("user_id", userId)
          .eq("stripe_subscription_id", subscriptionId)
          .single();

        if (existingSubscription) {
          // Actualizar suscripción existente
          await supabase
            .from("subscriptions")
            .update({
              plan: plan as "pro" | "enterprise",
              status: subscription.status === "active" ? "active" : "canceled",
              current_period_end: new Date(
                subscription.current_period_end * 1000
              ).toISOString(),
            })
            .eq("id", existingSubscription.id);
        } else {
          // Crear nueva suscripción
          await supabase.from("subscriptions").insert({
            user_id: userId,
            stripe_subscription_id: subscriptionId as string,
            plan: plan as "pro" | "enterprise",
            status: subscription.status === "active" ? "active" : "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          });
        }

        console.log(`Subscription created/updated for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;
        const plan = subscription.metadata?.plan;

        if (!userId) {
          // Intentar obtener desde customer
          const customer = await stripe.customers.retrieve(
            subscription.customer as string
          );
          if (customer && !customer.deleted) {
            const userData = await supabase
              .from("users")
              .select("id, subscription_status")
              .eq("stripe_customer_id", customer.id)
              .single();

            if (userData.data) {
              const planFromUser = userData.data.subscription_status;
              await supabase
                .from("users")
                .update({
                  subscription_status: planFromUser,
                })
                .eq("id", userData.data.id);

              await supabase
                .from("subscriptions")
                .update({
                  status: subscription.status === "active" ? "active" : "canceled",
                  current_period_end: new Date(
                    subscription.current_period_end * 1000
                  ).toISOString(),
                })
                .eq("stripe_subscription_id", subscription.id)
                .eq("user_id", userData.data.id);
            }
          }
          break;
        }

        // Actualizar subscription_status
        if (plan) {
          await supabase
            .from("users")
            .update({
              subscription_status: plan,
            })
            .eq("id", userId);
        }

        // Actualizar subscription
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status === "active" ? "active" : "canceled",
            current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id)
          .eq("user_id", userId);

        console.log(`Subscription updated for user ${userId}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const userId = subscription.metadata?.user_id;

        if (!userId) {
          // Intentar obtener desde customer
          const customer = await stripe.customers.retrieve(
            subscription.customer as string
          );
          if (customer && !customer.deleted) {
            const userData = await supabase
              .from("users")
              .select("id")
              .eq("stripe_customer_id", customer.id)
              .single();

            if (userData.data) {
              await supabase
                .from("users")
                .update({
                  subscription_status: "free",
                })
                .eq("id", userData.data.id);

              await supabase
                .from("subscriptions")
                .update({
                  status: "canceled",
                })
                .eq("stripe_subscription_id", subscription.id)
                .eq("user_id", userData.data.id);
            }
          }
          break;
        }

        // Cambiar a plan free
        await supabase
          .from("users")
          .update({
            subscription_status: "free",
          })
          .eq("id", userId);

        // Actualizar subscription
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
          })
          .eq("stripe_subscription_id", subscription.id)
          .eq("user_id", userId);

        console.log(`Subscription canceled for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: error?.message || "Error processing webhook" },
      { status: 500 }
    );
  }
}

