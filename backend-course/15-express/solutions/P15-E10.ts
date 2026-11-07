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

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `אין כתובת ${req.method} ${req.path}` } });
}

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { code: err.code, message: err.message } });
    return;
  }
  if (typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed") {
    res.status(400).json({ error: { code: "INVALID_JSON", message: "JSON לא תקין" } });
    return;
  }
  console.error(err);
  res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
}
