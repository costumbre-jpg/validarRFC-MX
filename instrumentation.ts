import { validateEnvironmentVariables } from "./lib/env-utils";

export async function register() {
  // Validate environment on startup
  validateEnvironmentVariables();

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
