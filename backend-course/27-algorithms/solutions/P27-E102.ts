// P27-E102: p50, p95, p99 — לא ממוצע
export function percentiles(latencies: number[], ps: number[]) {
  for (const p of ps) if (!(p > 0 && p <= 100)) throw new RangeError(`p לא תקין: ${p}`);
  const sorted = Float64Array.from(latencies).sort();
  const n = sorted.length;
  const out: Record<string, number | null> = {};
  for (const p of ps) out[`p${p}`] = n === 0 ? null : sorted[Math.ceil((p / 100) * n) - 1];
  return out;
}
