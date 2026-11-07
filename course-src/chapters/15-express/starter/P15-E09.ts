// P15-E09
// createLogger(write) → middleware שכותב "GET /products?page=2 200 3ms" אחרי כל תשובה
import type { Request, Response, NextFunction } from "express";

export function createLogger(write: (line: string) => void = console.log) {
  return (req: Request, res: Response, next: NextFunction) => {
    // כתוב כאן
  };
}
