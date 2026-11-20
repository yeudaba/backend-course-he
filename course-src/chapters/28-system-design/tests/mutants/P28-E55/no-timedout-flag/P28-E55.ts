// P28-E55: middleware של timeout
import type { Request, Response, NextFunction } from "express";

export function timeout(ms: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const timer = setTimeout(() => {
      if (res.headersSent) return;
      res.set("Retry-After", "1").status(503).json({ error: "timeout" });
    }, ms);
    res.on("finish", () => clearTimeout(timer));
    res.on("close", () => clearTimeout(timer));
    next();
  };
}
