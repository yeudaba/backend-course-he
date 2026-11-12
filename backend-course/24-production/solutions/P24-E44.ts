// P24-E44: error handler עם requestId
import type { NextFunction, Request, Response } from "express";

export type Log = (level: "warn" | "error", msg: string, fields: Record<string, unknown>) => void;

export function errorHandler(log: Log) {
  return (err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err); // אי אפשר לשנות תשובה שכבר יצאה
    const requestId = res.locals.requestId ?? null;
    const e = (err ?? {}) as { status?: unknown; message?: unknown; name?: unknown; stack?: unknown };
    if (typeof e.status === "number" && e.status >= 400 && e.status < 500) {
      log("warn", "client error", { requestId, status: e.status, message: String(e.message) });
      res.status(e.status).json({ error: { code: "BAD_REQUEST", message: "בקשה לא תקינה", requestId } });
      return;
    }
    log("error", "unhandled error", { requestId, err: { name: e.name, message: e.message, stack: e.stack } });
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה בשרת", requestId } });
  };
}
