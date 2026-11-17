// P25-E73: הפניה ל־HTTPS — רק כשמותר
import type { NextFunction, Request, Response } from "express";

export function requireHttps({ exclude = ["/health", "/ready"] }: { exclude?: string[] } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.secure || exclude.includes(req.originalUrl.split("?")[0])) return next();
    if (req.method === "GET" || req.method === "HEAD") {
      res.redirect(308, `https://${req.host}${req.originalUrl}`);
      return;
    }
    res.status(403).json({ error: { code: "HTTPS_REQUIRED", message: "השתמש ב־HTTPS" } });
  };
}
