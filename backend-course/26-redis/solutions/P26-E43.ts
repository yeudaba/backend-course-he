// P26-E43: Express — מונה צפיות ודירוג
import express from "express";
import type { Redis } from "ioredis";

export function viewsApp(redis: Redis) {
  const app = express();
  app.post("/products/:id/view", async (req, res) => {
    if (!/^[1-9]\d*$/.test(req.params.id)) return res.status(400).json({ error: "id לא תקין" });
    const id = req.params.id;
    const r = await redis.multi().hincrby("views", id, 1).zincrby("top", 1, id).exec();
    res.json({ productId: Number(id), views: Number(r![0][1]) });
  });
  app.get("/products/top", async (req, res) => {
    const raw = req.query.n ?? "5";
    const n = Number(raw);
    if (typeof raw !== "string" || !Number.isInteger(n) || n < 1 || n > 50) return res.status(400).json({ error: "n בין 1 ל־50" });
    const flat = await redis.zrevrange("top", 0, n - 1, "WITHSCORES");
    const out = [];
    for (let i = 0; i < flat.length; i += 2) out.push({ productId: Number(flat[i]), views: Number(flat[i + 1]) });
    res.json(out);
  });
  return app;
}
