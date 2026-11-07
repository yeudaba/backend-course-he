// P24-E18: middleware של הגבלת קצב — חלון נע
import type { NextFunction, Request, Response } from "express";

export function rateLimit({ limit, windowMs, now = () => Date.now(), key = (req) => req.ip ?? "unknown" }: {
  limit: number;
  windowMs: number;
  now?: () => number;
  key?: (req: Request) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
