// P25-E07: security headers
import type { NextFunction, Request, Response } from "express";

export function securityHeaders({ hstsMaxAge = 15_552_000 }: { hstsMaxAge?: number } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
