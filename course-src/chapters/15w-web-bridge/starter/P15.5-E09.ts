// P15.5-E09
// corsMiddleware(["http://localhost:5500"]) — ACAO למורשים, Vary: Origin תמיד, OPTIONS → 204
import type { Request, Response, NextFunction } from "express";

export function corsMiddleware(origins: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
    next();
  };
}
