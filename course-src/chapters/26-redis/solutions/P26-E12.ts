// P26-E12
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

// מחיקה רק אם הערך הוא ה־token שלי — בפקודה אחת (Lua רץ ב־Redis באופן אטומי)
const RELEASE = `if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end`;

export async function acquire(redis: Redis, name: string, ttlMs: number): Promise<string | null> {
  const token = randomUUID();
  // SET NX PX: "רק אם לא קיים" ועם תוקף — באותה פקודה. אם התהליך מת, המנעול משתחרר לבד
  const ok = await redis.set(`lock:${name}`, token, "PX", ttlMs, "NX");
  return ok === "OK" ? token : null;
}

export async function release(redis: Redis, name: string, token: string): Promise<boolean> {
  return (await redis.eval(RELEASE, 1, `lock:${name}`, token)) === 1;
}

export async function withLock<T>(redis: Redis, name: string, ttlMs: number, fn: () => Promise<T>): Promise<T | null> {
  const token = await acquire(redis, name, ttlMs);
  if (!token) return null; // מישהו אחר מחזיק — לא מחכים (לפי הצורך: לנסות שוב אחר כך)
  try {
    return await fn();
  } finally {
    await release(redis, name, token);
  }
}
