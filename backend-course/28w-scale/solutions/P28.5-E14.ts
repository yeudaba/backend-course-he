// P28.5-E14: מוניטור ל־event loop — מתריע כשמשהו חוסם
import { monitorEventLoopDelay } from "node:perf_hooks";

export interface LagReport {
  p99Ms: number;
  maxMs: number;
}

export function startLagMonitor({ thresholdMs, intervalMs = 1000, onLag }: { thresholdMs: number; intervalMs?: number; onLag: (r: LagReport) => void }): () => void {
  const h = monitorEventLoopDelay({ resolution: 10 });
  h.enable();
  const timer = setInterval(() => {
    const report = { p99Ms: Math.round(h.percentile(99) / 1e6), maxMs: Math.round(h.max / 1e6) }; // ננו־שניות ← מילי
    h.reset(); // כל חלון נמדד בנפרד
    if (report.maxMs >= thresholdMs) onLag(report);
  }, intervalMs);
  timer.unref(); // מוניטור לא אמור להשאיר את התהליך חי
  return () => {
    clearInterval(timer);
    h.disable();
  };
}
