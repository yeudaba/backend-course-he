// P26-E15: sliding window ב־Redis (sorted set)
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

export async function slidingHit(redis: Redis, clientId: string, { limit, windowMs, now = Date.now() }: { limit: number; windowMs: number; now?: number }) {
  return { allowed: true, remaining: limit, retryAfterSeconds: 0 }; // כתוב כאן
}
