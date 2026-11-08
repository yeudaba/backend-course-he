// P25-E23
import express from "express";

export function createApp({ limit = 5 }: { limit?: number } = {}) {
  const app = express();
  // תקלה 1: trust proxy = true — Express לוקח את הכתובת *הראשונה* ב־X-Forwarded-For, שהלקוח כותב בעצמו.
  // יש בדיוק proxy אחד לפנינו — סומכים על hop אחד
  app.set("trust proxy", 1);
  // תקלה 3: X-Powered-By: Express
  app.disable("x-powered-by");
  const hits = new Map<string, number>();
  app.use((req, res, next) => {
    // תקלה 2: HSTS על HTTP — דפדפן שקיבל אותו מ־localhost מסרב אחר כך ל־http://localhost. רק כשהחיבור מאובטח
    if (req.secure) res.setHeader("Strict-Transport-Security", "max-age=31536000");
    const n = (hits.get(req.ip ?? "") ?? 0) + 1;
    hits.set(req.ip ?? "", n);
    if (n > limit) return res.status(429).json({ error: "יותר מדי בקשות" });
    next();
  });
  app.post("/login", (req, res) => res.json({ ok: true }));
  return app;
}
