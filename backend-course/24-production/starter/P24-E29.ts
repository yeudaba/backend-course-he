// P24-E29: tracing לפי W3C Trace Context
import { AsyncLocalStorage } from "node:async_hooks";
import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

export interface Span {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  status: number;
  durationMs: number;
}

export function parseTraceparent(header: string | undefined): { traceId: string; parentId: string; sampled: boolean } | null {
  return null; // כתוב כאן
}

export function outgoingHeaders(): Record<string, string> {
  return {}; // כתוב כאן
}

export function tracing({
  onSpan,
  now = () => performance.now(),
  randomHex = (bytes: number) => randomBytes(bytes).toString("hex"),
}: {
  onSpan: (span: Span) => void;
  now?: () => number;
  randomHex?: (bytes: number) => string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    next(); // כתוב כאן
  };
}
