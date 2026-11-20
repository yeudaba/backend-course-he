// P26-E122: cache-aside לדף מוצר — מתוקן
import type { Redis } from "ioredis";

export async function cachedProduct<P>(redis: Redis | null, id: number, load: (id: number) => Promise<P | null>, ttlSec = 60) {
  const key = `product:${id}`;
  if (!redis) return { product: await load(id), cache: "OFF" as const };
  let cached: string | null;
  try {
    cached = await redis.get(key);
  } catch {
    throw new Error("redis down");
  }
  if (cached !== null) return { product: JSON.parse(cached) as P, cache: "HIT" as const };
  const product = await load(id);
  if (product !== null) await redis.set(key, JSON.stringify(product), "EX", ttlSec).catch(() => {});
  return { product, cache: "MISS" as const };
}
