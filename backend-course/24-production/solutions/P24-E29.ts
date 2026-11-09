// P24-E29
// tracing מינימלי לפי W3C Trace Context: traceparent נכנס ← span לבקשה ← traceparent יוצא
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

const TRACEPARENT = /^00-([0-9a-f]{32})-([0-9a-f]{16})-([0-9a-f]{2})$/;

export function parseTraceparent(header: string | undefined) {
  const m = header ? TRACEPARENT.exec(header.trim()) : null;
  if (!m) return null;
  const [, traceId, parentId, flags] = m;
  // מזהה של אפסים בלבד — לא תקין לפי התקן
  if (/^0+$/.test(traceId) || /^0+$/.test(parentId)) return null;
  return { traceId, parentId, sampled: (parseInt(flags, 16) & 1) === 1 };
}

const als = new AsyncLocalStorage<{ traceId: string; spanId: string }>();

// headers לבקשה יוצאת: השירות הבא יראה את ה־span שלנו כ"הורה"
export function outgoingHeaders(): Record<string, string> {
  const ctx = als.getStore();
  return ctx ? { traceparent: `00-${ctx.traceId}-${ctx.spanId}-01` } : {};
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
    const parent = parseTraceparent(req.get("traceparent"));
    const traceId = parent?.traceId ?? randomHex(16); // אין הורה תקין ← אנחנו תחילת ה־trace
    const spanId = randomHex(8);
    const start = now();
    res.set("X-Trace-Id", traceId);
    res.on("finish", () => {
      const route = req.route ? req.baseUrl + req.route.path : "unmatched";
      onSpan({ traceId, spanId, parentSpanId: parent?.parentId ?? null, name: `${req.method} ${route}`, status: res.statusCode, durationMs: now() - start });
    });
    als.run({ traceId, spanId }, next);
  };
}
