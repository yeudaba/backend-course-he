// P26-E25: אתגר — token bucket אטומי ב־Redis (Lua)
import type { Redis } from "ioredis";

export async function take(redis: Redis, key: string, { capacity, refillPerSecond, now = Date.now(), cost = 1 }: { capacity: number; refillPerSecond: number; now?: number; cost?: number }) {
  return { allowed: true, remaining: capacity, retryAfterSeconds: 0 }; // כתוב כאן
}
