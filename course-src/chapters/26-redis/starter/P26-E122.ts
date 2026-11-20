// P26-E122: cache-aside לדף מוצר — Redis נפל ← 500, מחיר לא מתעדכן, ומוצר חדש נשאר "לא נמצא".
// redis null או זורק ← OFF · יש ← HIT · אין ← load, ואם נמצא: שמירה ל־ttlSec ← MISS · null לא נשמר
//
// בדיקה:  npm run check P26-E122
import type { Redis } from "ioredis";

export async function cachedProduct<P>(redis: Redis | null, id: number, load: (id: number) => Promise<P | null>, ttlSec = 60) {
  const key = `product:${id}`;
  if (!redis) return { product: await load(id), cache: "OFF" as const };
  const cached = await redis.get(key);
  if (cached !== null) return { product: JSON.parse(cached) as P, cache: "HIT" as const };
  const product = await load(id);
  await redis.set(key, JSON.stringify(product));
  return { product, cache: "MISS" as const };
}
