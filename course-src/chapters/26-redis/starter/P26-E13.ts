// P26-E13: cache שעומד בעומס (stampede)
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

export function createStampedeCache(redis: Redis, { lockMs = 5000, waitMs = 3000, pollMs = 25 } = {}) {
  return {
    async get<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
      const cached = await redis.get(key);
      if (cached !== null) return JSON.parse(cached) as T;
      const value = await loader(); // כל בקשה שמגיעה עכשיו — טוענת בעצמה. 500 בקשות = 500 שאילתות
      await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
      return value;
    },
  };
}
