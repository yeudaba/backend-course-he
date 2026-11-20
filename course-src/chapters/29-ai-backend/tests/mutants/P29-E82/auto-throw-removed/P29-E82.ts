// P29-E82: תקציב יומי ב־Redis
import type { Redis } from "ioredis";

const MICRO = 1_000_000;

export function createRedisBudget(redis: Redis, opts: { dailyUsdPerUser: number; now?: () => number }) {
  const now = opts.now ?? Date.now;
  const capMicro = Math.round(opts.dailyUsdPerUser * MICRO);
  const key = (userId: string) => `ai:budget:${userId}:${new Date(now()).toISOString().slice(0, 10)}`;

  return {
    async check(userId: string) {
      const spent = Number((await redis.get(key(userId))) ?? 0);
      return { allowed: spent < capMicro, remainingUsd: Math.max(0, capMicro - spent) / MICRO };
    },
    async record(userId: string, usd: number) {

      const k = key(userId);
      await redis.incrby(k, Math.round(usd * MICRO));
      await redis.expire(k, 2 * 24 * 3600);
    },
  };
}
