import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { NextFunction, Request, Response } from "express";
import type { AppLogger } from "./logger";
import { requestContext } from "./request-context";

// מקבלים X-Request-Id מבחוץ רק אם הוא "נקי" — אחרת מישהו מזריק ללוגים מה שבא לו
const VALID_ID = /^[A-Za-z0-9._-]{1,64}$/;
const PROBES = new Set(["/health", "/ready"]);

// לכל בקשה: מזהה (מהלקוח או חדש), ב־header של התשובה, בהקשר של הבקשה — ושורת לוג אחת כשהיא מסתיימת
export function requestIdMiddleware(logger: AppLogger) {
  return (req: Request, res: Response, next: NextFunction) => {
    const incoming = req.get("x-request-id");
    const requestId = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
    res.setHeader("X-Request-Id", requestId);
    const started = performance.now(); // משך — שעון מונוטוני, לא שעת היום
    const context = { requestId } as { requestId: string; userId?: number };

    res.on("finish", () => {
      const status = res.statusCode;
      const path = req.originalUrl.split("?")[0]; // בלי query: לפעמים יש בו טוקנים
      // healthcheck של Docker ושל הפלטפורמה מגיע כל כמה שניות — בהצלחה הוא רק רעש, אז debug
      const level = status >= 500 ? "error" : status >= 400 ? "warn" : PROBES.has(path) ? "debug" : "info";
      // ה־guard שם את req.user — ואנחנו מוסיפים אותו להקשר בשביל הלוג הזה
      const userId = (req as Request & { user?: { id: number } }).user?.id;
      requestContext.run({ ...context, ...(userId ? { userId } : {}) }, () =>
        logger.write(level, "request", {
          method: req.method,
          path,
          status,
          durationMs: Math.round(performance.now() - started),
        }),
      );
    });

    requestContext.run(context, next);
  };
}
