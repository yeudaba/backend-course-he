// P26-E22
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

const RELEASE = `if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end`;

export async function acquire(redis: Redis, name: string, ttlMs: number): Promise<string | null> {
  // תקלה 1: בלי תוקף — שרת שקרס מחזיק את המנעול לנצח. SET … PX … NX: הכול בפקודה אחת
  // תקלה 2: הערך "locked" זהה לכולם — אי אפשר לדעת של מי המנעול. token ייחודי
  const token = randomUUID();
  return (await redis.set(`lock:${name}`, token, "PX", ttlMs, "NX")) === "OK" ? token : null;
}

export async function release(redis: Redis, name: string, token: string): Promise<boolean> {
  // תקלה 3: DEL בלי לבדוק — אם התוקף שלי נגמר ומישהו אחר לקח, מחקתי את שלו. בודקים ומוחקים באטומיות (Lua)
  return (await redis.eval(RELEASE, 1, `lock:${name}`, token)) === 1;
}
