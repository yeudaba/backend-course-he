// P24-E09: שורת לוג אחת לכל בקשה — כשהיא מסתיימת
import { performance } from "node:perf_hooks";
import type { NextFunction, Request, Response } from "express";

type Level = "debug" | "info" | "warn" | "error";
export type Log = (level: Level, msg: string, fields: Record<string, unknown>) => void;

export function requestLogger({ log, now = () => performance.now(), skip = [] }: { log: Log; now?: () => number; skip?: string[] }) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
