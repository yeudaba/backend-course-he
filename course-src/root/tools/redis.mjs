// עוזר לבדיקות של פרק 26: חיבור ל־Redis שלך (COURSE_REDIS_URL מה־.env, ברירת מחדל localhost:6379),
// עם prefix ייחודי לכל בדיקה — כך בדיקות לא נוגעות זו בזו ולא בנתונים שלך. בסוף: מוחקים את כל המפתחות שלהן.
import { randomBytes } from "node:crypto";
import { Redis } from "ioredis";

export const redisUrl = process.env.COURSE_REDIS_URL || "redis://localhost:6379";

export async function redisSandbox(t) {
  const prefix = `chk:${process.pid}:${randomBytes(3).toString("hex")}:`;
  const opts = { lazyConnect: true, maxRetriesPerRequest: 1, connectTimeout: 3000 };
  const redis = new Redis(redisUrl, { ...opts, keyPrefix: prefix }); // הלקוח שלך — כל המפתחות מקבלים prefix אוטומטית
  const raw = new Redis(redisUrl, opts); // לבודק: בלי prefix
  try {
    await redis.connect();
    await raw.connect();
  } catch (err) {
    redis.disconnect();
    raw.disconnect();
    throw new Error(`אין חיבור ל־Redis (${redisUrl}): ${err.message}. הרץ: docker run -d --name redis -p 6379:6379 redis:8-alpine (פרק 26, קופסת 🧰)`);
  }
  const extra = [];
  t.after(async () => {
    for (const c of extra) await c.quit().catch(() => c.disconnect());
    let cursor = "0";
    do {
      const [next, keys] = await raw.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 500);
      if (keys.length) await raw.del(...keys);
      cursor = next;
    } while (cursor !== "0");
    await redis.quit().catch(() => redis.disconnect());
    await raw.quit().catch(() => raw.disconnect());
  });
  return {
    redis,
    raw,
    prefix,
    url: redisUrl,
    // חיבור נוסף עם אותו prefix (למשל "שרת שני", או לקוח שמחכה ב־BLPOP)
    async client() {
      const c = new Redis(redisUrl, { ...opts, keyPrefix: prefix });
      await c.connect();
      extra.push(c);
      return c;
    },
    // ל־BullMQ: הוא לא תומך ב־keyPrefix של ioredis — מעבירים לו prefix משלו
    bullPrefix: prefix.slice(0, -1),
    // BullMQ: Worker דורש maxRetriesPerRequest: null (מחכה לעבודות בלי סוף)
    connection: () => {
      const u = new URL(redisUrl);
      return { host: u.hostname, port: Number(u.port || 6379), maxRetriesPerRequest: null };
    },
  };
}
