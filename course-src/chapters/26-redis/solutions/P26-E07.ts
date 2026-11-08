// P26-E07
import type { Redis } from "ioredis";

// cache-aside: קודם Redis; אין ← טוענים מהמקור ושומרים עם TTL
export function createCacheAside(redis: Redis) {
  const stats = { hits: 0, misses: 0 };
  async function get<T>(key: string, ttlSeconds: number, load: () => Promise<T>): Promise<T> {
    const raw = await redis.get(key);
    if (raw !== null) {
      stats.hits++;
      return JSON.parse(raw) as T;
    }
    stats.misses++;
    const value = await load(); // אם load זורק — לא שומרים כלום (לא מחזיקים שגיאות ב־cache)
    if (value !== undefined && value !== null) await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return value;
  }
  return { get, stats, invalidate: (key: string) => redis.del(key) };
}
