// P15-E09
import type { Request, Response, NextFunction } from "express";

export function createLogger(write: (line: string) => void = console.log) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    res.on("finish", () => {
      write(`${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - start)}ms`);
    });
    next();
  };
}
