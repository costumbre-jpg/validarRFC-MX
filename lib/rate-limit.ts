import { getRedis } from "./redis";

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
};

/**
 * Rate limit distribuido con Redis (o in-memory fallback).
 */
export async function rateLimit({
  key,
  limit,
  windowSeconds,
  fallbackMap,
}: {
  key: string;
  limit: number;
  windowSeconds: number;
  fallbackMap: Map<string, { count: number; resetTime: number }>;
}): Promise<RateLimitResult> {
  const redis = getRedis();

  if (!redis) {
    // Fallback en memoria (no distribuido)
    const now = Date.now();
    const entry = fallbackMap.get(key);
    if (!entry || now > entry.resetTime) {
      fallbackMap.set(key, { count: 1, resetTime: now + windowSeconds * 1000 });
      return { allowed: true, remaining: limit - 1, resetSeconds: windowSeconds };
    }
    if (entry.count >= limit) {
      const remainingWindow = Math.ceil((entry.resetTime - now) / 1000);
      return { allowed: false, remaining: 0, resetSeconds: remainingWindow };
    }
    entry.count += 1;
    fallbackMap.set(key, entry);
    return { allowed: true, remaining: limit - entry.count, resetSeconds: Math.ceil((entry.resetTime - now) / 1000) };
  }

  // Redis: INCR + EXPIRE atomico
  const redisKey = `ratelimit:${key}`;
  const tx = redis.pipeline();
  tx.incr(redisKey);
  tx.expire(redisKey, windowSeconds);
  const [countResp] = (await tx.exec()) as [number, unknown][];
  const count = Number(countResp);

  if (count > limit) {
    const ttl = await redis.ttl(redisKey);
    return { allowed: false, remaining: 0, resetSeconds: ttl > 0 ? ttl : windowSeconds };
  }

  const remaining = Math.max(limit - count, 0);
  const ttl = await redis.ttl(redisKey);
  return {
    allowed: true,
    remaining,
    resetSeconds: ttl > 0 ? ttl : windowSeconds,
  };
}

