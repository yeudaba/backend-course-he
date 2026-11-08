// P26-E13
import { randomUUID } from "node:crypto";
import type { Redis } from "ioredis";

const RELEASE = `if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end`;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// מניעת stampede: מפתח פופולרי פג תוקף, ו־500 בקשות טוענות אותו מהמסד בבת אחת.
// בתוך תהליך — "single flight" (Promise משותף). בין שרתים — מנעול: רק אחד טוען, האחרים מחכים לערך
export function createStampedeCache(redis: Redis, { lockMs = 5000, waitMs = 3000, pollMs = 25 } = {}) {
  const inFlight = new Map<string, Promise<unknown>>();

  async function load<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const cached = await redis.get(key);
    if (cached !== null) return JSON.parse(cached) as T;
    const token = randomUUID();
    if ((await redis.set(`${key}:lock`, token, "PX", lockMs, "NX")) === "OK") {
      try {
        const value = await loader();
        await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
        return value;
      } finally {
        await redis.eval(RELEASE, 1, `${key}:lock`, token);
      }
    }
    // מישהו אחר טוען — מחכים שהערך יופיע. לא הופיע בזמן? טוענים בעצמנו (עדיף איטי מתקוע)
    for (const end = Date.now() + waitMs; Date.now() < end; ) {
      await sleep(pollMs);
      const v = await redis.get(key);
      if (v !== null) return JSON.parse(v) as T;
    }
    return loader();
  }

  return {
    get<T>(key: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
      const existing = inFlight.get(key);
      if (existing) return existing as Promise<T>;
      const p = load(key, ttlSeconds, loader).finally(() => inFlight.delete(key));
      inFlight.set(key, p);
      return p;
    },
  };
}
