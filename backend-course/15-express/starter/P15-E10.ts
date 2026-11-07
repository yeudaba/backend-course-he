// P15-E10
import type { Request, Response, NextFunction } from "express";

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// 404 { error: { code: "NOT_FOUND", message: `אין כתובת ${method} ${path}` } }
export function notFound(req: Request, res: Response) {
  // כתוב כאן
}

// HttpError → status שלה | JSON שבור → 400 INVALID_JSON | אחר → 500 INTERNAL + console.error
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // כתוב כאן
}
