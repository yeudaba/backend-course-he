// P26-E07: cache-aside
import type { Redis } from "ioredis";

export function createCacheAside(redis: Redis) {
  const stats = { hits: 0, misses: 0 };
  async function get<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
    return load(); // כתוב כאן
  }
  return { get, stats, invalidate: (key: string) => redis.del(key) };
}
