// P26-E69: middleware של הגבלת קצב, משותף לשני שרתים
import type express from "express";
import type { Redis } from "ioredis";

type Opts = { limit: number; windowSeconds: number; keyOf?: (req: express.Request) => string; now?: () => number };

export function rateLimit(redis: Redis, { limit, windowSeconds, keyOf = (req) => req.ip ?? "unknown", now = Date.now }: Opts): express.RequestHandler {
  return async (req, res, next) => {
    const t = now();
    const window = Math.floor(t / 1000 / windowSeconds);
    const key = `rl:${keyOf(req)}:${window}`;
    const r = await redis.multi().incr(key).expire(key, windowSeconds, "NX").exec();
    const count = Number(r![0][1]);
    res.set("X-RateLimit-Limit", String(limit));
    res.set("X-RateLimit-Remaining", String(Math.max(0, limit - count)));
    if (count > limit) {
      const end = (window + 1) * windowSeconds * 1000;
      res.set("Retry-After", String(Math.ceil((end - t) / 1000)));
      return res.status(429).json({ error: "יותר מדי בקשות" });
    }
    next();
  };
}
