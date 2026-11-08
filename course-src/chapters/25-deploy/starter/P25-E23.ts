// P25-E23: שרת מאחורי proxy אחד (Render). שלוש תקלות: הגבלת הקצב נעקפת בקלות,
// דפדפנים "נועלים" את עצמם ל־HTTPS גם בפיתוח, והשרת מספר לכולם על מה הוא רץ
import express from "express";

export function createApp({ limit = 5 }: { limit?: number } = {}) {
  const app = express();
  app.set("trust proxy", true);
  const hits = new Map<string, number>();
  app.use((req, res, next) => {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
    const n = (hits.get(req.ip ?? "") ?? 0) + 1;
    hits.set(req.ip ?? "", n);
    if (n > limit) return res.status(429).json({ error: "יותר מדי בקשות" });
    next();
  });
  app.post("/login", (req, res) => res.json({ ok: true }));
  return app;
}
