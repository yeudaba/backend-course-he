import type { Request, Response, NextFunction } from "express";

export function logger(write: (line: string) => void) {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = performance.now();
    res.on("finish", () => {
      write(`${req.method} ${req.originalUrl} ${res.statusCode} ${Math.round(performance.now() - start)}ms`);
    });
    next();
  };
}
