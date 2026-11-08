// P26-E21: הגבלת קצב "משותפת לכל השרתים". שלוש תקלות: משתמש אחד חוסם את כולם,
// מי שממשיך לשלוח לא משתחרר לעולם, ותחת עומס עוברות יותר בקשות מהמגבלה. מצא ותקן
import type { Redis } from "ioredis";

export async function allow(redis: Redis, clientId: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = "ratelimit";
  const count = Number((await redis.get(key)) ?? 0) + 1;
  await redis.set(key, count);
  await redis.expire(key, windowSeconds);
  return count <= limit;
}
