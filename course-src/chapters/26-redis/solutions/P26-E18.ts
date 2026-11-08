// P26-E18
import type { Redis } from "ioredis";

// "צרכן idempotent": תורים מבטיחים "לפחות פעם אחת" — לא "בדיוק פעם אחת". retry, worker שנפל אחרי העבודה ולפני ack…
// לכן כל הודעה מסומנת כ"טופלה". SET NX: רק הראשון מצליח לסמן. נכשל באמצע? מוחקים את הסימון — שינסו שוב
export async function processOnce<T>(redis: Redis, messageId: string, ttlSeconds: number, handler: () => Promise<T>): Promise<{ processed: boolean; result?: T }> {
  const key = `processed:${messageId}`;
  if ((await redis.set(key, "1", "EX", ttlSeconds, "NX")) !== "OK") return { processed: false };
  try {
    return { processed: true, result: await handler() };
  } catch (err) {
    await redis.del(key);
    throw err;
  }
}
