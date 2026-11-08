// P26-E22: מנעול ל"דוח לילי" — שלוש תקלות. שרת שקרס השאיר מנעול לתמיד,
// ושרת שעבד לאט מחק מנעול של שרת אחר. מצא ותקן (בלי לשנות חתימות)
import type { Redis } from "ioredis";

export async function acquire(redis: Redis, name: string, ttlMs: number): Promise<string | null> {
  const ok = await redis.setnx(`lock:${name}`, "locked");
  return ok === 1 ? "locked" : null;
}

export async function release(redis: Redis, name: string, token: string): Promise<boolean> {
  return (await redis.del(`lock:${name}`)) === 1;
}
