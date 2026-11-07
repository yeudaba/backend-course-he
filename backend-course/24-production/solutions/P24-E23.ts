// P24-E23
import type { NextFunction, Request, Response } from "express";

export function rateLimit({ limit, windowMs, now = () => Date.now() }: { limit: number; windowMs: number; now?: () => number }) {
  const hits = new Map<string, number[]>();
  return (req: Request, res: Response, next: NextFunction) => {
    // תקלה 1: X-Forwarded-For הוא header שהלקוח שולח כרצונו — כל בקשה עם ערך אחר "עוקפת" את המגבלה.
    // req.ip בלבד; מאחורי proxy מוכר — app.set("trust proxy", 1), ו־Express מחשב את req.ip נכון
    const client = req.ip ?? "unknown";
    const t = now();
    const recent = (hits.get(client) ?? []).filter((x) => x > t - windowMs);
    if (recent.length >= limit) {
      hits.set(client, recent);
      // תקלה 3: Retry-After הוא בשניות (RFC 9110). 60000 = "חכה 16 שעות"
      res.setHeader("Retry-After", String(Math.ceil((recent[0] + windowMs - t) / 1000)));
      return res.status(429).json({ error: "יותר מדי בקשות" });
    }
    // תקלה 2: הבקשה נספרה לפני הבדיקה — גם הנדחות. לקוח שממשיך לנסות היה חסום לתמיד
    recent.push(t);
    hits.set(client, recent);
    next();
  };
}
