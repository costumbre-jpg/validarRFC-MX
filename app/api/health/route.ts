import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Health check endpoint
 * Returns status of all critical services
 * GET /api/health
 */
export async function GET() {
  const checks = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      api: "healthy",
      database: "unknown",
      stripe: "unknown",
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
  };

  // Check Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      checks.services.database = "misconfigured";
      checks.status = "degraded";
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from("users").select("id").limit(1);

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine for health check
        checks.services.database = "unhealthy";
        checks.status = "unhealthy";
      } else {
        checks.services.database = "healthy";
      }
    }
  } catch (error) {
    checks.services.database = "unhealthy";
    checks.status = "unhealthy";
  }

  // Check Stripe configuration
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      checks.services.stripe = "misconfigured";
      checks.status = checks.status === "healthy" ? "degraded" : checks.status;
    } else {
      checks.services.stripe = "healthy";
    }
  } catch (error) {
    checks.services.stripe = "unhealthy";
    checks.status = "unhealthy";
  }

  const statusCode = checks.status === "healthy" ? 200 : checks.status === "degraded" ? 200 : 503;

  return NextResponse.json(checks, { status: statusCode });
}
