// P27-E93: Idempotency-Key בזיכרון
import { createHash } from "node:crypto";

type Entry = { hash: string; promise: Promise<unknown>; at: number };

export function createIdempotency(ttlMs: number, now: () => number = Date.now) {
  const entries = new Map<string, Entry>();
  return {
    async run<T>(key: string, body: unknown, fn: () => Promise<T>) {
      const hash = createHash("sha256").update(JSON.stringify(body)).digest("hex");
      const e = entries.get(key);
      if (e && now() - e.at < ttlMs) {
        if (e.hash !== hash) throw new Error("KEY_REUSED");
        return { status: "replayed" as const, result: (await e.promise) as T };
      }
      const promise = fn();
      entries.set(key, { hash, promise, at: now() });
      promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key);
      });
      return { status: "fresh" as const, result: await promise };
    },
  };
}
