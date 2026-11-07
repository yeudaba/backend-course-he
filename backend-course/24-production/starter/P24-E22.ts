// P24-E22: middleware של Idempotency-Key עם שלוש תקלות. מצא ותקן
import type { NextFunction, Request, Response } from "express";

export function idempotency() {
  const saved = new Map<string, { status: number; body: unknown }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("idempotency-key");
    if (req.method !== "POST" || !key) return next();
    const userId = req.get("x-user-id") ?? "anonymous";

    const hit = saved.get(key);
    if (hit) return res.status(hit.status).set("Idempotent-Replayed", "true").json(hit.body);

    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      saved.set(key, { status: res.statusCode, body });
      return json(body);
    };
    next();
  };
}
