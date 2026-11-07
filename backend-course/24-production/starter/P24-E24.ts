// P24-E24: אתגר — API קטן של הזמנות, מוכן לפרודקשן
import { createHash, randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import express, { type NextFunction, type Request, type Response } from "express";

interface Options {
  clock?: () => Date;
  logSink?: (line: string) => void;
  rateLimitPerMinute?: number;
}

export function createApp({ clock = () => new Date(), logSink = (l) => process.stdout.write(l + "\n"), rateLimitPerMinute = 5 }: Options = {}) {
  const app = express();
  app.locals.draining = false;
  // כתוב כאן
  return app;
}
