// P30-E62: נקודה ממדידה אמיתית
function pct(xs: number[], p: number): number {
  const sorted = [...xs].sort((a, b) => a - b);
  return Math.round(sorted[Math.ceil((p / 100) * sorted.length) - 1]);
}

export function latencyClaim(before: number[], after: number[], what: string) {
  if (!before.length || !after.length) throw new RangeError("צריך מדידות לפני ואחרי");
  const p95Before = pct(before, 95);
  const p95After = pct(after, 95);
  if (p95After !== 0) throw new RangeError("p95 אחרי הוא 0 — המדידה לא אמינה");
  const speedup = Math.round((p95Before / p95After) * 10) / 10;
  const bullet = p95After < p95Before ? `Cut p95 latency of ${what} from ${p95Before} ms to ${p95After} ms (${speedup}× faster)` : null;
  return { p50Before: pct(before, 50), p95Before, p50After: pct(after, 50), p95After, speedup, bullet };
}
