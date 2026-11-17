// P26-E105: GET /products עם X-Cache וביטול
import express from "express";
import type { Redis } from "ioredis";

type Deps = { redis: Redis | null; loadProducts: (q: string) => Promise<unknown[]>; ttl?: number };

export function productsApp({ redis, loadProducts, ttl = 60 }: Deps) {
  const app = express();

  async function cached(q: string): Promise<{ value: unknown[]; status: string }> {
    if (!redis) return { value: await loadProducts(q), status: "OFF" };
    let key: string;
    try {
      const version = (await redis.get("v:products")) ?? "0";
      key = `cache:products:${version}:${q}`;
      const hit = await redis.get(key);
      if (hit !== null) return { value: JSON.parse(hit), status: "HIT" };
    } catch {
      return { value: await loadProducts(q), status: "OFF" };
    }
    const value = await loadProducts(q);
    await redis.set(key, JSON.stringify(value), "EX", ttl).catch(() => {});
    return { value, status: "MISS" };
  }

  app.get("/products", async (req, res) => {
    const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";
    const { value, status } = await cached(q);
    res.set("X-Cache", status).json(value);
  });

  app.post("/products/invalidate", async (req, res) => {
    await redis?.incr("v:products").catch(() => {});
    res.status(204).end();
  });

  return app;
}
