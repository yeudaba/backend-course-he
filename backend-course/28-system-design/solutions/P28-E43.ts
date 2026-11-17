// P28-E43: GET /estimate עם Zod
import express from "express";
import { z } from "zod";

const Query = z.object({
  users: z.coerce.number().int().positive(),
  perUser: z.coerce.number().int().positive(),
  peak: z.coerce.number().min(1).max(100).default(3),
});

const round1 = (n: number) => Math.round(n * 10) / 10;

export function estimateApp() {
  const app = express();
  app.get("/estimate", (req, res) => {
    const r = Query.safeParse(req.query);
    if (!r.success) {
      const fields = [...new Set(r.error.issues.map((i) => String(i.path[0])))].sort();
      return res.status(400).json({ error: "invalid query", fields });
    }
    const avg = (r.data.users * r.data.perUser) / 86_400;
    res.json({ avgRps: round1(avg), peakRps: round1(avg * r.data.peak) });
  });
  return app;
}
