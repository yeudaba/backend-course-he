// P24-E08: middleware של X-Request-Id
import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export function requestId({ generate = randomUUID }: { generate?: () => string } = {}) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
