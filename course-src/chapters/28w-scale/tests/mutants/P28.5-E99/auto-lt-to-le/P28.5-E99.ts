// P28.5-E99: API אנליטי — ולידציה, מפתח cache ו־asOf
import express from "express";
import { z } from "zod";

const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => !Number.isNaN(Date.parse(s)), "תאריך לא תקין");
const Query = z
  .object({
    from: day,
    to: day,
    country: z.string().regex(/^[a-zA-Z]{2}$/).transform((s) => s.toUpperCase()).optional(),
  })
  .refine((q) => q.from <= q.to, "from אחרי to")
  .refine((q) => (Date.parse(q.to) - Date.parse(q.from)) / 86_400_000 <= 92, "טווח של עד 92 יום");

type Deps = {
  query(p: { from: string; to: string; country: string | null }): Promise<unknown[]>;
  asOf(): string;
  now(): number;
  ttlMs: number;
};

export function revenueApi(deps: Deps) {
  const cache = new Map<string, { at: number; body: { rows: unknown[]; asOf: string } }>();
  const app = express();
  app.get("/revenue", async (req, res) => {
    const r = Query.safeParse(req.query);
    if (!r.success) return res.status(400).json({ error: r.error.issues[0]?.message ?? "invalid" });
    const p = { from: r.data.from, to: r.data.to, country: r.data.country ?? null };
    const key = `${p.from}|${p.to}|${p.country ?? ""}`;
    const hit = cache.get(key);
    if (hit && deps.now() - hit.at <= deps.ttlMs) {
      res.set("X-Cache", "HIT");
      return res.json(hit.body);
    }
    const body = { rows: await deps.query(p), asOf: deps.asOf() };
    cache.set(key, { at: deps.now(), body });
    res.set("X-Cache", "MISS").json(body);
  });
  return app;
}
