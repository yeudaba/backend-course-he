// P26-E20
import type { Redis } from "ioredis";

export async function cachedSearch<T>(redis: Redis, query: { q: string; page: number }, load: () => Promise<T>): Promise<T> {
  // תקלה 1: המפתח חייב לכלול את *כל* מה שמשפיע על התשובה — גם page
  const key = `search:${JSON.stringify([query.q, query.page])}`;
  const cached = await redis.get(key);
  // תקלה 3: if (cached) / if (value) — 0, "", [] ו־false הם ערכים תקינים. בודקים null בלבד
  if (cached !== null) return JSON.parse(cached) as T;
  const value = await load();
  // תקלה 2: בלי EX הערך לא פג לעולם — שינוי מחיר לא יגיע ללקוח אף פעם
  await redis.set(key, JSON.stringify(value), "EX", 60);
  return value;
}
