import type { Request, Response, NextFunction } from "express";

export interface ErrorDetail {
  path: string;
  message: string;
}

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

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `אין כתובת ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    const { code, message, details } = err;
    res.status(err.status).json({ error: { code, message, ...(details ? { details } : {}) } });
    return;
  }
  if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON לא תקין" } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
}
