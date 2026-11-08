// P25-E07
import type { NextFunction, Request, Response } from "express";

export function securityHeaders({ hstsMaxAge = 15_552_000 }: { hstsMaxAge?: number } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.removeHeader("X-Powered-By"); // לא לפרסם באיזו טכנולוגיה (וגרסה) השרת רץ
    res.setHeader("X-Content-Type-Options", "nosniff"); // הדפדפן לא "מנחש" סוג קובץ
    res.setHeader("X-Frame-Options", "DENY"); // אי אפשר להטמיע את הדפים ב־iframe (clickjacking)
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    // HSTS — רק על חיבור HTTPS. req.secure נכון גם מאחורי proxy, אם trust proxy מוגדר
    if (req.secure) res.setHeader("Strict-Transport-Security", `max-age=${hstsMaxAge}; includeSubDomains`);
    next();
  };
}
