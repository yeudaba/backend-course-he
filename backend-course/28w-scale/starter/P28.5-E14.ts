// P28.5-E14: מוניטור ל־event loop — מתריע כשמשהו חוסם
import { monitorEventLoopDelay } from "node:perf_hooks";

export interface LagReport {
  p99Ms: number;
  maxMs: number;
}

export function startLagMonitor({ thresholdMs, intervalMs = 1000, onLag }: { thresholdMs: number; intervalMs?: number; onLag: (r: LagReport) => void }): () => void {
  throw new Error("עוד לא כתבת את הפתרון");
}
