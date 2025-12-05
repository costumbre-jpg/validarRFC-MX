import * as crypto from "crypto";

const API_KEY_PREFIX = "sk_live_";
const API_KEY_LENGTH = 32;

/**
 * Genera una nueva API key
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(API_KEY_LENGTH);
  return API_KEY_PREFIX + randomBytes.toString("base64url");
}

/**
 * Genera el hash de una API key para almacenamiento seguro
 */
export function hashApiKey(apiKey: string): string {
  return crypto.createHash("sha256").update(apiKey).digest("hex");
}

/**
 * Obtiene el prefijo de una API key para mostrar
 */
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, API_KEY_PREFIX.length + 8) + "...";
}

/**
 * Valida el formato de una API key
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  return apiKey.startsWith(API_KEY_PREFIX) && apiKey.length > API_KEY_PREFIX.length + 20;
}

