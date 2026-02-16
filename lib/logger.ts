/**
 * Production-safe logging utility
 * Prevents sensitive info leaks in production
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function shouldLog(level: LogLevel): boolean {
  // In production, don't log debug
  if (process.env.NODE_ENV === "production" && level === "debug") {
    return false;
  }
  return true;
}

function sanitizeError(error: unknown): unknown {
  if (error instanceof Error) {
    // Don't expose internal server details in production
    if (process.env.NODE_ENV === "production") {
      return {
        message: error.message,
        name: error.name,
      };
    }
    return error;
  }
  return error;
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog("debug")) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },

  info: (message: string, data?: unknown) => {
    if (shouldLog("info")) {
      console.info(`[INFO] ${message}`, data);
    }
  },

  warn: (message: string, data?: unknown) => {
    if (shouldLog("warn")) {
      console.warn(`[WARN] ${message}`, data);
    }
  },

  error: (message: string, error?: unknown) => {
    if (shouldLog("error")) {
      const sanitized = sanitizeError(error);
      console.error(`[ERROR] ${message}`, sanitized);
    }
  },
};

export default logger;
