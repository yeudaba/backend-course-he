// P26-E24
import type { Redis } from "ioredis";

const minuteOf = (now: number) => Math.floor(now / 60_000);

// "חם עכשיו": sorted set לכל דקה. צפייה ← ZINCRBY בדלי של הדקה הנוכחית (שמת לבד אחרי שעתיים)
export async function recordView(redis: Redis, productId: number, now = Date.now()) {
  const key = `trend:${minuteOf(now)}`;
  await redis.multi().zincrby(key, 1, String(productId)).expire(key, 7200).exec();
}

// N הדקות האחרונות: ZUNIONSTORE מחבר את הדליים (סכום ה־scores) למפתח זמני, ומשם — ה־top
export async function trending(redis: Redis, { windowMinutes, n, now = Date.now() }: { windowMinutes: number; n: number; now?: number }) {
  const m = minuteOf(now);
  const buckets = Array.from({ length: windowMinutes }, (_, i) => `trend:${m - i}`);
  const tmp = `trend:tmp:${m}:${windowMinutes}:${Math.random().toString(36).slice(2)}`;
  const results = await redis
    .multi()
    .zunionstore(tmp, buckets.length, ...buckets)
    .zrevrange(tmp, 0, n - 1, "WITHSCORES")
    .del(tmp)
    .exec();
  const flat = results![1][1] as string[];
  return Array.from({ length: flat.length / 2 }, (_, i) => ({ productId: Number(flat[2 * i]), views: Number(flat[2 * i + 1]) }));
}
