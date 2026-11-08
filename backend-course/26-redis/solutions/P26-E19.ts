// P26-E19
import type { Redis } from "ioredis";

// cache בזיכרון של התהליך (L1, הכי מהיר) — אבל עם כמה שרתים, כל אחד מחזיק עותק משלו.
// כששרת אחד משנה, הוא מפרסם ב־pub/sub, וכל השרתים מוחקים את העותק שלהם
export async function createL1Cache(redis: Redis, subscriber: Redis, channel = "cache-invalidate") {
  const local = new Map<string, unknown>();
  await subscriber.subscribe(channel);
  subscriber.on("message", (ch: string, key: string) => {
    if (ch === channel) local.delete(key);
  });
  return {
    async get<T>(key: string, load: () => Promise<T>): Promise<T> {
      if (local.has(key)) return local.get(key) as T;
      const value = await load();
      local.set(key, value);
      return value;
    },
    // מקומית מיד, ולכל השאר דרך Redis
    async invalidate(key: string) {
      local.delete(key);
      await redis.publish(channel, key);
    },
    size: () => local.size,
  };
}
