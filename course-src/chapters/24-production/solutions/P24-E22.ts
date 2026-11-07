// P24-E22
import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function idempotency() {
  const saved = new Map<string, { fingerprint: string; status: number; body: unknown }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("idempotency-key");
    if (req.method !== "POST" || !key) return next();
    const userId = req.get("x-user-id") ?? "anonymous";
    // תקלה 1: המפתח היה גלובלי — יוסי עם אותו מפתח כמו דנה קיבל את ההזמנה של דנה (דליפת מידע!)
    const id = JSON.stringify([userId, key]);
    // תקלה 2: בלי טביעת אצבע — אותו מפתח עם גוף אחר החזיר בשקט את התשובה הישנה
    const fingerprint = createHash("sha256").update(JSON.stringify([req.path, req.body ?? null])).digest("hex");

    const hit = saved.get(id);
    if (hit && hit.fingerprint !== fingerprint) return res.status(422).json({ error: "המפתח כבר שימש לבקשה אחרת" });
    if (hit) return res.status(hit.status).set("Idempotent-Replayed", "true").json(hit.body);

    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      // תקלה 3: גם 500 נשמר — וכל ניסיון חוזר קיבל את אותה שגיאה לנצח, בלי לנסות באמת
      if (res.statusCode < 500) saved.set(id, { fingerprint, status: res.statusCode, body });
      return json(body);
    };
    next();
  };
}
