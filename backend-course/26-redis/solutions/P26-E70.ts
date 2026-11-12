// P26-E70: מנעול שמחכה בתור
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

const RELEASE = `if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withLockRetry<T>(redis: Redis, name: string, ttlMs: number, fn: () => Promise<T>, opts: { retries?: number; delayMs?: number } = {}): Promise<T> {
  const { retries = 10, delayMs = 50 } = opts;
  const key = `lock:${name}`;
  const token = randomUUID();
  for (let attempt = 0; attempt <= retries; attempt++) {
    if ((await redis.set(key, token, "PX", ttlMs, "NX")) === "OK") {
      try {
        return await fn();
      } finally {
        await redis.eval(RELEASE, 1, key, token);
      }
    }
    if (attempt < retries) await sleep(delayMs);
  }
  throw new Error("LOCKED");
}
