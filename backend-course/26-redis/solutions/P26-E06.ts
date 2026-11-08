// P26-E06
import type { Redis } from "ioredis";

// מטמון JSON פשוט מעל Redis: מחרוזות בלבד שם — לכן JSON.stringify / parse
export function createJsonStore(redis: Redis) {
  return {
    async set(key: string, value: unknown, ttlSeconds?: number) {
      if (value === undefined) throw new Error("אין ערך לשמור");
      const json = JSON.stringify(value);
      if (ttlSeconds) await redis.set(key, json, "EX", ttlSeconds);
      else await redis.set(key, json);
    },
    async get<T>(key: string): Promise<T | null> {
      const raw = await redis.get(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    },
    async del(key: string) {
      return (await redis.del(key)) === 1;
    },
    // כמה שניות נשארו: null — אין מפתח; Infinity — בלי תוקף
    async ttl(key: string) {
      const t = await redis.ttl(key);
      return t === -2 ? null : t === -1 ? Infinity : t;
    },
  };
}
