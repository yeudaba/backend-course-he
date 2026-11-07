// P15.5-E09
import type { Request, Response, NextFunction } from "express";

export function corsMiddleware(origins: string[]) {
  const allowed = new Set(origins);
  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.get("origin");
    const ok = origin !== undefined && allowed.has(origin);
    res.vary("Origin");
    if (ok) res.set("Access-Control-Allow-Origin", origin);

    if (req.method === "OPTIONS") {
      if (ok) {
        res.set({
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE",
          "Access-Control-Allow-Headers": req.get("access-control-request-headers") ?? "Content-Type",
          "Access-Control-Max-Age": "600",
        });
      }
      res.sendStatus(204);
      return;
    }
    next();
  };
}
