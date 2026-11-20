// P28.5-E56: load shedding לפי event loop lag
import type { Request, Response, NextFunction } from "express";

export function shedLoad(opts: { getLagMs: () => number; maxLagMs: number; exempt?: string[] }) {
  const { getLagMs, maxLagMs, exempt = ["/health", "/ready"] } = opts;
  return (req: Request, res: Response, next: NextFunction) => {
    const lag = getLagMs();
    res.set("X-Lag-Ms", String(Math.round(lag)));
    if (exempt.includes(req.path) && lag <= maxLagMs) return next();
    res.set("Retry-After", "2").status(503).json({ error: "overloaded" });
  };
}
