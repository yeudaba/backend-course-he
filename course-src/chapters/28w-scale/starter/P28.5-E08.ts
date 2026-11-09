// P28.5-E08: מחולל עומס קטן — concurrency קבוע, ו־percentiles של זמני תגובה
import { performance } from "node:perf_hooks";

export interface LoadResult {
  total: number;
  errors: number;
  durationMs: number;
  rps: number;
  latency: { p50: number; p95: number; p99: number; max: number };
}

export async function runLoad(request: () => Promise<unknown>, { concurrency, total }: { concurrency: number; total: number }): Promise<LoadResult> {
  throw new Error("עוד לא כתבת את הפתרון");
}
