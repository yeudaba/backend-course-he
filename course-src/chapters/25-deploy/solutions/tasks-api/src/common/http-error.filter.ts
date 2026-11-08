import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";
import { HttpError } from "../errors";

const CODES: Record<number, string> = { 400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT", 429: "TOO_MANY_REQUESTS", 413: "PAYLOAD_TOO_LARGE" };

// כל שגיאה ← אותו מבנה כמו בגרסת ה־Express: { error: { code, message, details? } }
@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger("HttpErrorFilter");

  catch(err: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (err instanceof HttpError) {
      const { code, message, details } = err;
      res.status(err.status).json({ error: { code, message, ...(details ? { details } : {}) } });
      return;
    }
    if (err instanceof HttpException) {
      const status = err.getStatus();
      // body-parser של Express זורק על JSON שבור — Nest עוטף את זה כ־400
      const body = err.getResponse() as { message?: unknown };
      const isJson = typeof body?.message === "string" && /JSON/i.test(body.message);
      const code = status === 404 ? "NOT_FOUND" : isJson ? "INVALID_JSON" : (CODES[status] ?? "ERROR");
      const message = status === 404 ? "לא נמצא" : isJson ? "JSON לא תקין" : err.message;
      res.status(status).json({ error: { code, message } });
      return;
    }
    this.logger.error(err);
    res.status(500).json({ error: { code: "INTERNAL", message: "שגיאה פנימית" } });
  }
}
