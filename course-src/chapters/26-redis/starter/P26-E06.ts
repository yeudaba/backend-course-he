// P26-E06: מטמון JSON מעל Redis
import type { Redis } from "ioredis";

export function createJsonStore(redis: Redis) {
  return {
    async set(key: string, value: unknown, ttlSeconds?: number) {
      // כתוב כאן
    },
    async get<T>(key: string): Promise<T | null> {
      return null;
    },
    async del(key: string): Promise<boolean> {
      return false;
    },
    async ttl(key: string): Promise<number | null> {
      return null;
    },
  };
}
