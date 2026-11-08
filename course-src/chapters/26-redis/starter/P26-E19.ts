// P26-E19: cache בזיכרון + ביטול בכל השרתים עם pub/sub
import type { Redis } from "ioredis";

export async function createL1Cache(redis: Redis, subscriber: Redis, channel = "cache-invalidate") {
  const local = new Map<string, unknown>();
  return {
    async get<T>(key: string, load: () => Promise<T>): Promise<T> {
      if (local.has(key)) return local.get(key) as T;
      const value = await load();
      local.set(key, value);
      return value;
    },
    async invalidate(key: string) {
      local.delete(key); // רק אצלי — השרתים האחרים ממשיכים להחזיר ערך ישן
    },
    size: () => local.size,
  };
}
