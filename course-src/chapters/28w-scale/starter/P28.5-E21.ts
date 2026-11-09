// P28.5-E21: דוח latency מכמה שרתים — שלוש תקלות
export function latencyReport(perInstance: number[][]): { count: number; p50: number; p99: number } {
  const pct = (samples: number[], p: number) => {
    const s = [...samples].sort();
    return s[Math.floor((p / 100) * s.length)];
  };
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  return {
    count: perInstance.reduce((s, x) => s + x.length, 0),
    p50: avg(perInstance.map((s) => pct(s, 50))),
    p99: avg(perInstance.map((s) => pct(s, 99))),
  };
}
