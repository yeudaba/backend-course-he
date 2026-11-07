// P24-E18
import type { NextFunction, Request, Response } from "express";

export function rateLimit({ limit, windowMs, now = () => Date.now(), key = (req) => req.ip ?? "unknown" }: {
  limit: number;
  windowMs: number;
  now?: () => number;
  key?: (req: Request) => string;
}) {
  const hits = new Map<string, number[]>(); // לכל לקוח — הזמנים של הבקשות שעברו, בחלון האחרון
  let lastSweep = now();

  return (req: Request, res: Response, next: NextFunction) => {
    const t = now();
    // ניקוי מדי פעם: לקוח שהלך — לא נשאר בזיכרון לנצח
    if (t - lastSweep >= windowMs) {
      for (const [k, times] of hits) if (times.at(-1)! <= t - windowMs) hits.delete(k);
      lastSweep = t;
    }
    const id = key(req);
    const recent = (hits.get(id) ?? []).filter((x) => x > t - windowMs);
    const resetSeconds = (oldest: number) => Math.max(1, Math.ceil((oldest + windowMs - t) / 1000));
    res.setHeader("RateLimit-Limit", String(limit));

    if (recent.length >= limit) {
      hits.set(id, recent); // הבקשה שנדחתה לא נספרת
      const retry = resetSeconds(recent[0]);
      res.setHeader("RateLimit-Remaining", "0");
      res.setHeader("RateLimit-Reset", String(retry));
      res.setHeader("Retry-After", String(retry)); // בשניות, לפי התקן — לא מילישניות
      return res.status(429).json({ error: "יותר מדי בקשות" });
    }
    recent.push(t);
    hits.set(id, recent);
    res.setHeader("RateLimit-Remaining", String(limit - recent.length));
    res.setHeader("RateLimit-Reset", String(resetSeconds(recent[0])));
    next();
  };
}

