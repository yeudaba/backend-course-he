// P26-E14
import type { Redis } from "ioredis";

// cache עם "גרסה" לכל קבוצה: invalidate = INCR אחד, במקום לחפש ולמחוק את כל הווריאציות
export function createVersionedCache(redis: Redis) {
  const version = async (group: string) => (await redis.get(`v:${group}`)) ?? "0";
  return {
    async get<T>(group: string, key: string, ttlSeconds: number, load: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
      const full = `c:${group}:${await version(group)}:${key}`;
      const raw = await redis.get(full);
      if (raw !== null) return { value: JSON.parse(raw) as T, hit: true };
      const value = await load();
      await redis.set(full, JSON.stringify(value), "EX", ttlSeconds);
      return { value, hit: false };
    },
    // המפתחות הישנים לא נמחקים — הם פשוט לא נקראים יותר, ומתים ב־TTL
    invalidate: (group: string) => redis.incr(`v:${group}`),
  };
}
