// P24-E120: span לכל פעולה, עם AsyncLocalStorage
import { AsyncLocalStorage } from "node:async_hooks";

export type Span = { traceId: string; spanId: string; parentSpanId: string | null; name: string; durationMs: number; error: boolean };

export function createTracer({ onSpan, now, randomHex }: { onSpan: (s: Span) => void; now: () => number; randomHex: (bytes: number) => string }) {
  const als = new AsyncLocalStorage<{ traceId: string; spanId: string }>();
  return {
    async withSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
      const parent = als.getStore();
      const traceId = parent?.traceId ?? randomHex(16);
      const spanId = randomHex(8);
      const start = now();
      let error = false;
      try {
        return await als.run({ traceId, spanId }, fn); // כל מה שבתוך fn רואה את ה־span הזה כנוכחי
      } catch (err) {
        error = true;
        throw err;
      } finally {
        onSpan({ traceId, spanId, parentSpanId: parent?.spanId ?? null, name, durationMs: now() - start, error });
      }
    },
    currentTraceId: () => als.getStore()?.traceId,
  };
}
