// P26-E42: לבנות דירוג מחדש משורות SQL
import type { Redis } from "ioredis";

export async function rebuildBestsellers(redis: Redis, key: string, rows: { product_id: number; qty: string | number }[]) {
  const m = redis.multi().del(key);
  for (const r of rows) m.zadd(key, Number(r.qty), String(r.product_id));
  await m.expire(key, 86400).exec();
  return rows.length;
}

export async function topBestsellers(redis: Redis, key: string, n: number) {
  const flat = await redis.zrevrange(key, 0, n - 1, "WITHSCORES");
  const out: { productId: number; qty: number }[] = [];
  for (let i = 0; i < flat.length; i += 2) out.push({ productId: Number(flat[i]), qty: Number(flat[i + 1]) });
  return out;
}
