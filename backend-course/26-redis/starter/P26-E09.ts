// P26-E09: הגבלת קצב ב־Redis (fixed window)
import type { Redis } from "ioredis";

export async function hit(redis: Redis, clientId: string, { limit, windowSeconds, now = Date.now() }: { limit: number; windowSeconds: number; now?: number }) {
  return { allowed: true, remaining: limit, resetSeconds: windowSeconds }; // כתוב כאן
}
