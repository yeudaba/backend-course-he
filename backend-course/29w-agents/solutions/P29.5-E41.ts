// P29.5-E41: לכל היותר שתי ריצות ללקוח, ב־Redis
import type { Redis } from "ioredis";

export function createRunSlots(redis: Redis, opts: { maxPerUser: number; ttlSeconds: number }) {
  const key = (userId: string) => `agent:runs:${userId}`;
  return {
    async acquire(userId: string) {
      const n = await redis.incr(key(userId));
      if (n > opts.maxPerUser) {
        await redis.decr(key(userId));
        return false;
      }
      await redis.expire(key(userId), opts.ttlSeconds);
      return true;
    },
    async release(userId: string) {
      if ((await redis.decr(key(userId))) < 0) await redis.del(key(userId));
    },
    async active(userId: string) {
      return Number((await redis.get(key(userId))) ?? 0);
    },
  };
}
