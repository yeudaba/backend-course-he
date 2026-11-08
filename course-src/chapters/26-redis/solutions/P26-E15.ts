// P26-E15
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

// sliding window ב־sorted set: כל בקשה = איבר עם score = זמן. סופרים רק את ה־windowMs האחרונות
export async function slidingHit(redis: Redis, clientId: string, { limit, windowMs, now = Date.now() }: { limit: number; windowMs: number; now?: number }) {
  const key = `sw:${clientId}`;
  const results = await redis
    .multi()
    .zremrangebyscore(key, "-inf", now - windowMs) // מנקים את מה שיצא מהחלון
    .zcard(key)
    .zrange(key, 0, 0, "WITHSCORES")
    .exec();
  const count = Number(results![1][1]);
  const oldest = results![2][1] as string[];
  if (count >= limit) {
    // נדחה — לא נספר (פרק 24). Retry-After: עד שהוותיק יוצא מהחלון
    const retryAfterMs = Number(oldest[1]) + windowMs - now;
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }
  await redis.multi().zadd(key, now, `${now}-${randomUUID()}`).pexpire(key, windowMs).exec();
  return { allowed: true, remaining: limit - count - 1, retryAfterSeconds: 0 };
}
