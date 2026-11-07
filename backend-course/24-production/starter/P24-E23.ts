// P24-E23: הגבלת קצב עם שלוש תקלות. מצא ותקן
import type { NextFunction, Request, Response } from "express";

export function rateLimit({ limit, windowMs, now = () => Date.now() }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    const client = req.get("x-forwarded-for") ?? req.ip ?? "unknown";
    const t = now();
    const recent = (hits.get(client) ?? []).filter((x) => x > t - windowMs);
    recent.push(t);
    hits.set(client, recent);
    if (recent.length > limit) {
      res.setHeader("Retry-After", String(recent[0] + windowMs - t));
      return res.status(429).json({ error: "יותר מדי בקשות" });
    }
    next();
  };
}
