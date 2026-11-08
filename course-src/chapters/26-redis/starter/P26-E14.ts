// P26-E14: ביטול cache עם גרסה לכל קבוצה
import type { Redis } from "ioredis";

export function createVersionedCache(redis: Redis) {
  return {
    async get<T>(group: string, key: string, ttlSeconds: number, load: () => Promise<T>): Promise<{ value: T; hit: boolean }> {
      return { value: await load(), hit: false }; // כתוב כאן
    },
    async invalidate(group: string): Promise<number> {
      return 0; // כתוב כאן
    },
  };
}
