// P26-E51: cache-aside עם TTL אקראי
import type { Redis } from "ioredis";

export async function getOrSetJitter<T>(redis: Redis, key: string, ttl: number, load: () => Promise<T>, random: () => number = Math.random): Promise<T> {
  const hit = await redis.get(key);
  if (hit !== null) return JSON.parse(hit) as T;
  const value = await load();
  const realTtl = ttl + Math.floor(random() * ttl * 0.2);
  await redis.set(key, JSON.stringify(value), "EX", realTtl);
  return value;
}
