// P26-E57: middleware של cache ל־Express
import type express from "express";
import type { Redis } from "ioredis";

export function cacheMiddleware(redis: Redis, ttl: number): express.RequestHandler {
  return async (req, res, next) => {
    if (req.method !== "GET") return next();
    if (req.headers.authorization) {
      res.set("X-Cache", "BYPASS");
      return next();
    }
    const key = `page:${req.originalUrl}`;
    const hit = await redis.get(key);
    if (hit !== null) {
      res.set("X-Cache", "HIT").type("application/json").send(hit);
      return;
    }
    res.set("X-Cache", "MISS");
    const original = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode === 200) void redis.set(key, JSON.stringify(body), "EX", ttl).catch(() => {});
      return original(body);
    };
    next();
  };
}
