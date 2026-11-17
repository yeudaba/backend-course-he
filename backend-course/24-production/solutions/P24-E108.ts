// P24-E108: exception filter עם requestId
import { HttpException, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import type { Response } from "express";

type Log = (level: "warn" | "error", msg: string, fields: Record<string, unknown>) => void;
const CODES: Record<number, string> = { 400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 429: "TOO_MANY_REQUESTS" };

export class RequestIdErrorFilter implements ExceptionFilter {
  #log: Log;
  constructor(log: Log) {
    this.#log = log;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const requestId = res.getHeader("X-Request-Id") ?? null;
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (status < 500) this.#log("warn", "http error", { status, requestId });
      res.status(status).json({ error: { code: CODES[status] ?? "ERROR", message: exception.message, requestId } });
      return;
    }
    this.#log("error", "unhandled", { requestId, message: exception instanceof Error ? exception.message : String(exception) });
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית", requestId } });
  }
}
