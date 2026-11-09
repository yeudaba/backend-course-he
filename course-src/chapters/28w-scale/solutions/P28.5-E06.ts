// P28.5-E06: percentiles — לא ממוצע
export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) throw new Error("אין דגימות");
  if (!(p > 0 && p <= 100)) throw new Error("p בין 0 (לא כולל) ל־100");
  const rank = Math.ceil((p / 100) * sorted.length); // nearest-rank: 1..n
  return sorted[rank - 1];
}

export interface Summary {
  count: number;
  min: number;
  max: number;
  mean: number;
  p50: number;
  p95: number;
  p99: number;
}

export function summarize(samples: number[]): Summary {
  const s = [...samples].sort((a, b) => a - b); // עותק, ומיון מספרי
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  return {
    count: s.length,
    min: s[0],
    max: s[s.length - 1],
    mean: Math.round(mean * 100) / 100,
    p50: percentile(s, 50),
    p95: percentile(s, 95),
    p99: percentile(s, 99),
  };
}
