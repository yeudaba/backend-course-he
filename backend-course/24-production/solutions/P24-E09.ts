// P24-E09
import { performance } from "node:perf_hooks";
import type { NextFunction, Request, Response } from "express";

type Level = "debug" | "info" | "warn" | "error";
export type Log = (level: Level, msg: string, fields: Record<string, unknown>) => void;

export function requestLogger({ log, now = () => performance.now(), skip = [] }: { log: Log; now?: () => number; skip?: string[] }) {
  return (req: Request, res: Response, next: NextFunction) => {
    const started = now(); // שעון מונוטוני: Date.now() יכול "לקפוץ" כששעון המחשב מתעדכן
    res.on("finish", () => {
      const path = req.originalUrl.split("?")[0]; // query יכול להכיל טוקנים ומידע אישי
      const status = res.statusCode;
      if (status < 400 && skip.includes(path)) return;
      const level: Level = status >= 500 ? "error" : status >= 400 ? "warn" : "info";
      log(level, "request", {
        method: req.method,
        path,
        status,
        durationMs: Math.round(now() - started),
        ...(res.locals.requestId ? { requestId: res.locals.requestId } : {}),
      });
    });
    next();
  };
}
