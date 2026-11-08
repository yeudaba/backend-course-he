// P26-E09
import type { Redis } from "ioredis";

// fixed window ב־Redis: מונה לכל (לקוח, חלון). משותף לכל השרתים — בניגוד ל־Map בזיכרון (פרק 24)
export async function hit(redis: Redis, clientId: string, { limit, windowSeconds, now = Date.now() }: { limit: number; windowSeconds: number; now?: number }) {
  const window = Math.floor(now / 1000 / windowSeconds);
  const key = `rl:${clientId}:${window}`;
  // INCR אטומי; EXPIRE רק כשהמפתח נוצר עכשיו (NX) — המונה מת לבד בסוף החלון
  const [[, count]] = (await redis.multi().incr(key).expire(key, windowSeconds, "NX").exec()) as [[null, number], [null, number]];
  const resetSeconds = (window + 1) * windowSeconds - Math.floor(now / 1000);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetSeconds };
}
