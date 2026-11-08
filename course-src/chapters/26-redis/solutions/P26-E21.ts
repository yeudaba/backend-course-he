// P26-E21
import type { Redis } from "ioredis";

export async function allow(redis: Redis, clientId: string, limit: number, windowSeconds: number): Promise<boolean> {
  // תקלה 1: מפתח אחד לכולם — הלקוח העשירי חוסם את כל השאר. מפתח לכל לקוח
  const key = `ratelimit:${clientId}`;
  // תקלה 3: GET ואז SET — שתי בקשות קוראות 4 ושתיהן כותבות 5. INCR אטומי
  // תקלה 2: EXPIRE בכל בקשה מאריך את החלון שוב ושוב — מי שממשיך לשלוח לא משתחרר. NX: רק כשאין תוקף
  const results = await redis.multi().incr(key).expire(key, windowSeconds, "NX").exec();
  return Number(results![0][1]) <= limit;
}
