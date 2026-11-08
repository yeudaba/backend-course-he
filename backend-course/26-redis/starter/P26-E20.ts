// P26-E20: cache לחיפוש מוצרים. שלוש תקלות: עמוד 2 מחזיר את עמוד 1, מחירים ישנים נשארים "לתמיד",
// וחיפוש בלי תוצאות פוגע במסד בכל פעם. מצא ותקן
import type { Redis } from "ioredis";

export async function cachedSearch<T>(redis: Redis, query: { q: string; page: number }, load: () => Promise<T>): Promise<T> {
  const key = `search:${query.q}`;
  const cached = await redis.get(key);
  if (cached) {
    const value = JSON.parse(cached);
    if (value) return value as T;
  }
  const value = await load();
  await redis.set(key, JSON.stringify(value));
  return value;
}
