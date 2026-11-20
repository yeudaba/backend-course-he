// P28.5-E40: middleware של histogram ו־GET /slo
import express from "express";
import type { Request, Response, NextFunction } from "express";

export function sloMetrics(opts: { buckets: number[]; latencyMs: number; target: number; now?: () => number }) {
  const now = opts.now ?? (() => performance.now());
  const limit = opts.buckets.indexOf(opts.latencyMs);

  const counts = new Array(opts.buckets.length + 1).fill(0);
  const goodCounts = new Array(opts.buckets.length + 1).fill(0);
  let errors = 0;

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/slo") return next();
    const start = now();
    res.on("finish", () => {
      const ms = now() - start;
      let i = opts.buckets.findIndex((b) => ms <= b);
      if (i === -1) i = opts.buckets.length;
      counts[i]++;
      if (res.statusCode >= 500) errors++;
      else goodCounts[i]++;
    });
    next();
  };

  const router = express.Router();
  router.get("/slo", (req, res) => {
    const total = counts.reduce((a, b) => a + b, 0);
    const good = goodCounts.slice(0, limit + 1).reduce((a, b) => a + b, 0);
    res.json({ total, errors, buckets: counts, good, ok: total === 0 || good / total >= opts.target });
  });
  return { middleware, router };
}
