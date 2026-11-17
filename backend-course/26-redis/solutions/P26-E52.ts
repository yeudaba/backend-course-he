// P26-E52: גם "אין" נשמר — negative caching
import type { Redis } from "ioredis";

const NONE = "__none__";

export async function findProduct<T>(redis: Redis, id: number, loadFromDb: (id: number) => Promise<T | null>, opts: { ttl?: number; missTtl?: number } = {}): Promise<T | null> {
  const { ttl = 300, missTtl = 30 } = opts;
  const key = `product:${id}`;
  const hit = await redis.get(key);
  if (hit === NONE) return null;
  if (hit !== null) return JSON.parse(hit) as T;
  const value = await loadFromDb(id);
  if (value === null) {
    await redis.set(key, NONE, "EX", missTtl);
    return null;
  }
  await redis.set(key, JSON.stringify(value), "EX", ttl);
  return value;
}
