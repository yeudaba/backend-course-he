// P26-E08
import type { Redis } from "ioredis";

// צפיות במוצרים: מונה לכל יום (ומחיקה אוטומטית אחרי שבוע), ו־sorted set לדירוג
export async function trackView(redis: Redis, productId: number, now: Date) {
  const day = now.toISOString().slice(0, 10);
  const views = `views:${day}`;
  // MULTI: הכול יחד, בלי שבקשה אחרת תיכנס באמצע
  const results = await redis
    .multi()
    .hincrby(views, String(productId), 1)
    .expire(views, 7 * 86400)
    .zincrby(`top:${day}`, 1, String(productId))
    .expire(`top:${day}`, 7 * 86400)
    .exec();
  return Number(results![0][1]); // התוצאה של הפקודה הראשונה (HINCRBY)
}

export async function topProducts(redis: Redis, day: string, n: number): Promise<{ productId: number; views: number }[]> {
  const flat = await redis.zrevrange(`top:${day}`, 0, n - 1, "WITHSCORES");
  const out = [];
  for (let i = 0; i < flat.length; i += 2) out.push({ productId: Number(flat[i]), views: Number(flat[i + 1]) });
  return out;
}
