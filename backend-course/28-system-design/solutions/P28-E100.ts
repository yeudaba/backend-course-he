// P28-E100: עמדנו ביעדים?
export function verdict(results: { ms: number; status: number }[], targets: { p99Ms: number; maxErrorRate: number }) {
  const count = results.length;
  if (count === 0) return { count: 0, p50: 0, p99: 0, errorRate: 0, pass: false, reasons: ["no results"] };
  const sorted = results.map((r) => r.ms).sort((a, b) => a - b);
  const pct = (n: number) => sorted[Math.ceil((n / 100) * count) - 1];
  const p50 = pct(50);
  const p99 = pct(99);
  const errorRate = results.filter((r) => r.status >= 500).length / count;
  const asPct = (x: number) => Number((x * 100).toFixed(2));
  const reasons: string[] = [];
  if (p99 > targets.p99Ms) reasons.push(`p99 ${p99}ms > ${targets.p99Ms}ms`);
  if (errorRate > targets.maxErrorRate) reasons.push(`errors ${asPct(errorRate)}% > ${asPct(targets.maxErrorRate)}%`);
  return { count, p50, p99, errorRate, pass: reasons.length === 0, reasons };
}
