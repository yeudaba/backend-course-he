// P26-E11
import type { Redis } from "ioredis";

// "צפית לאחרונה": רשימה לכל משתמש, הכי חדש ראשון, בלי כפילויות, עד max, ונמחקת אחרי 30 יום בלי פעילות
export async function viewed(redis: Redis, userId: number, productId: number, max = 10) {
  const key = `recent:${userId}`;
  await redis
    .multi()
    .lrem(key, 0, String(productId)) // אם כבר שם — מוציאים, כדי שיעלה לראש
    .lpush(key, String(productId))
    .ltrim(key, 0, max - 1) // רשימה חסומה: לא גדלה לנצח
    .expire(key, 30 * 86400)
    .exec();
}

export async function recent(redis: Redis, userId: number): Promise<number[]> {
  return (await redis.lrange(`recent:${userId}`, 0, -1)).map(Number);
}
