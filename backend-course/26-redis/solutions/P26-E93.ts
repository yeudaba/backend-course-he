// P26-E93: getOrSet — HIT, MISS או OFF
import type { Redis } from "ioredis";

type Status = "HIT" | "MISS" | "OFF";

export async function getOrSet<T>(redis: Redis | null, group: string, key: string, ttl: number, load: () => Promise<T>): Promise<{ value: T; status: Status }> {
  if (!redis) return { value: await load(), status: "OFF" };
  let fullKey: string;
  try {
    const version = (await redis.get(`v:${group}`)) ?? "0";
    fullKey = `cache:${group}:${version}:${key}`;
    const hit = await redis.get(fullKey);
    if (hit !== null) return { value: JSON.parse(hit) as T, status: "HIT" };
  } catch {
    return { value: await load(), status: "OFF" };
  }
  const value = await load();
  await redis.set(fullKey, JSON.stringify(value), "EX", ttl).catch(() => {});
  return { value, status: "MISS" };
}

export async function invalidate(redis: Redis | null, group: string) {
  await redis?.incr(`v:${group}`).catch(() => {});
}
