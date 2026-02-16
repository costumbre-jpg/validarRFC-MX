/**
 * Validates required environment variables on startup
 * Run this in middleware.ts or instrumentation.ts
 */

const REQUIRED_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const OPTIONAL_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "NEXT_PUBLIC_SENTRY_DSN",
  "NEXT_PUBLIC_GA_MEASUREMENT_ID",
  "RESEND_API_KEY",
];

export function validateEnvironmentVariables() {
  const missing: string[] = [];
  const invalid: { key: string; value: string; reason: string }[] = [];

  // Check required vars
  for (const key of REQUIRED_ENV_VARS) {
    const value = process.env[key];
    if (!value) {
      missing.push(key);
    }
  }

  // Validate Supabase URL format
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
    invalid.push({
      key: "NEXT_PUBLIC_SUPABASE_URL",
      value: supabaseUrl,
      reason: "Must start with https://",
    });
  }

  // Validate Site URL format
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && !siteUrl.startsWith("http")) {
    invalid.push({
      key: "NEXT_PUBLIC_SITE_URL",
      value: siteUrl,
      reason: "Must start with http:// or https://",
    });
  }

  // Print warnings for optional vars not set
  const optionalNotSet: string[] = [];
  for (const key of OPTIONAL_ENV_VARS) {
    if (!process.env[key]) {
      optionalNotSet.push(key);
    }
  }

  // Report issues
  if (missing.length > 0) {
    console.error(
      "❌ CRITICAL: Missing required environment variables:",
      missing.join(", ")
    );
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing required env vars: ${missing.join(", ")}`);
    }
  }

  if (invalid.length > 0) {
    console.error("❌ CRITICAL: Invalid environment variables:");
    for (const item of invalid) {
      console.error(`  - ${item.key}: ${item.reason}`);
    }
    if (process.env.NODE_ENV === "production") {
      throw new Error("Invalid environment variables detected");
    }
  }

  if (optionalNotSet.length > 0 && process.env.NODE_ENV !== "test") {
    console.warn(
      "⚠️  WARNING: Optional features disabled:",
      optionalNotSet.join(", ")
    );
  }

  console.log("✅ Environment variables validated");
}
