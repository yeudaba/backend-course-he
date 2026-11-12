// P21-E81: CORS לרשימה מפורשת
import type { NextFunction, Request, Response } from "express";

export function corsAllowlist(allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.set("Vary", "Origin");
    const origin = req.get("origin");
    const ok = origin !== undefined && allowed.includes(origin);
    if (ok) {
      res.set("Access-Control-Allow-Origin", origin);
      res.set("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
      if (!ok) return res.status(403).end();
      res.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      return res.status(204).end();
    }
    next();
  };
}
