// P24-E114: סיכום latency
export function percentile(sortedMs: number[], p: number): number {
  if (!(p > 0 && p <= 100) || sortedMs.length === 0) throw new RangeError(`אחוזון לא תקין: ${p}`);
  return sortedMs[Math.ceil((p / 100) * sortedMs.length) - 1];
}

export function latencySummary(ms: number[]) {
  if (ms.length === 0) return null;
  const sorted = [...ms].sort((a, b) => a - b);
  const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  return {
    count: sorted.length,
    avg: Math.round(avg * 10) / 10,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1],
  };
}

const ms = [...Array.from({ length: 94 }, (_, i) => 30 + ((i * 7) % 20)), 1500, 1700, 1900, 2100, 2300, 2500];
console.log(latencySummary(ms));
