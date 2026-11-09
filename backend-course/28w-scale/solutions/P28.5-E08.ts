// P28.5-E08: מחולל עומס קטן — concurrency קבוע, ו־percentiles של זמני תגובה
import { performance } from "node:perf_hooks";

export interface LoadResult {
  total: number;
  errors: number;
  durationMs: number;
  rps: number;
  latency: { p50: number; p95: number; p99: number; max: number };
}

const pct = (s: number[], p: number) => s[Math.max(0, Math.ceil((p / 100) * s.length) - 1)];

export async function runLoad(request: () => Promise<unknown>, { concurrency, total }: { concurrency: number; total: number }): Promise<LoadResult> {
  const latencies: number[] = [];
  let errors = 0;
  let next = 0;
  const started = performance.now();
  // concurrency "עובדים", כל אחד שולח בקשה, מחכה לתשובה, ושולח את הבאה — כמו concurrency משתמשים
  async function worker() {
    while (next < total) {
      next++;
      const t0 = performance.now();
      try {
        await request();
      } catch {
        errors++;
      }
      latencies.push(performance.now() - t0);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, total) }, worker));
  const durationMs = performance.now() - started;
  latencies.sort((a, b) => a - b);
  const r = (x: number) => Math.round(x * 10) / 10;
  return {
    total,
    errors,
    durationMs: r(durationMs),
    rps: r((total / durationMs) * 1000),
    latency: { p50: r(pct(latencies, 50)), p95: r(pct(latencies, 95)), p99: r(pct(latencies, 99)), max: r(latencies.at(-1)!) },
  };
}
