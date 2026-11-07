// P15.5-E12
import type { Request, Response, NextFunction } from "express";

function matcher(pattern: string): (origin: string) => boolean {
  if (!pattern.includes("*")) return (origin) => origin === pattern;
  const source = pattern
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&"))
    .join("[a-z0-9-]+");
  const re = new RegExp(`^${source}$`);
  return (origin) => re.test(origin);
}

export function createCors({ allow, credentials = false, maxAge = 600 }: { allow: string[]; credentials?: boolean; maxAge?: number }) {
  const matchers = allow.map(matcher);
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get("origin");
    if (origin === undefined) return next();
    res.vary("Origin");
    const ok = matchers.some((m) => m(origin));
    const isPreflight = req.method === "OPTIONS" && req.get("access-control-request-method") !== undefined;

    if (!ok) {
      if (isPreflight) {
        res.status(403).json({ error: { code: "CORS_ORIGIN_NOT_ALLOWED", message: `origin לא מורשה: ${origin}` } });
        return;
      }
      return next();
    }

    res.set("Access-Control-Allow-Origin", origin);
    if (credentials) res.set("Access-Control-Allow-Credentials", "true");
    if (isPreflight) {
      res.set({
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE",
        "Access-Control-Allow-Headers": req.get("access-control-request-headers") ?? "Content-Type",
        "Access-Control-Max-Age": String(maxAge),
      });
      res.sendStatus(204);
      return;
    }
    next();
  };
}
