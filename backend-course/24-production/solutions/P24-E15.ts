// P24-E15
import { createHash } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface StoredResponse {
  status: number;
  body: unknown;
}
export interface Store {
  begin(scope: string, key: string, fingerprint: string): { kind: "new" } | { kind: "replay"; response: StoredResponse } | { kind: "mismatch" } | { kind: "in_progress" };
  complete(scope: string, key: string, response: StoredResponse): void;
  release(scope: string, key: string): void;
}

const VALID_KEY = /^[A-Za-z0-9_-]{8,100}$/;

export function idempotency({ store, scope = (req) => req.get("x-user-id") ?? "anonymous" }: { store: Store; scope?: (req: Request) => string }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.get("idempotency-key");
    if (req.method !== "POST" || key === undefined) return next(); // GET/PUT/DELETE כבר idempotent; בלי מפתח — רגיל
    if (!VALID_KEY.test(key)) return res.status(400).json({ error: "Idempotency-Key לא תקין" });

    const who = scope(req);
    // אותו מפתח לבקשה אחרת (נתיב או גוף אחר) — זו טעות של הלקוח, לא "ניסיון חוזר"
    const fingerprint = createHash("sha256").update(JSON.stringify([req.method, req.path, req.body ?? null])).digest("hex");
    const r = store.begin(who, key, fingerprint);
    if (r.kind === "mismatch") return res.status(422).json({ error: "המפתח כבר שימש לבקשה אחרת" });
    if (r.kind === "in_progress") return res.status(409).json({ error: "בקשה עם המפתח הזה עדיין בטיפול" });
    if (r.kind === "replay") return res.status(r.response.status).set("Idempotent-Replayed", "true").json(r.response.body);

    let done = false;
    const json = res.json.bind(res);
    res.json = (body: unknown) => {
      done = true;
      // 5xx — תקלה אצלנו, לא תשובה: משחררים, כדי שניסיון חוזר באמת ינסה שוב
      if (res.statusCode >= 500) store.release(who, key);
      else store.complete(who, key, { status: res.statusCode, body });
      return json(body);
    };
    // נגמר בלי res.json (חריגה ← טיפול השגיאות של Express, או החיבור נסגר) — משחררים
    res.on("close", () => {
      if (!done) store.release(who, key);
    });
    next();
  };
}
