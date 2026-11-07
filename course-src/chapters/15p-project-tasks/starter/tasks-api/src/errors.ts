// שלב 2. מבוסס על תרגיל P15-E10 — מותר להעתיק את הפתרון שלך ולהרחיב.
import type { Request, Response, NextFunction } from "express";

export interface ErrorDetail {
  path: string;
  message: string;
}

// HttpError(status, code, message, details?)
export class HttpError extends Error {
  status: number;
  code: string;
  details?: ErrorDetail[];
  constructor(status: number, code: string, message: string, details?: ErrorDetail[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// 404 { error: { code: "NOT_FOUND", message } }
export function notFound(req: Request, res: Response) {
  // כתוב כאן
}

// HttpError → { error: { code, message, details? } } | JSON שבור → 400 INVALID_JSON | אחר → 500 INTERNAL
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // כתוב כאן
}
