// P18-E67: "index" ממוין בזיכרון
export function createIndex<T>(rows: T[], key: (row: T) => number) {
  const sorted = rows.map((row, i) => ({ row, k: key(row), i })).sort((a, b) => a.k - b.k || a.i - b.i);
  const keys = sorted.map((s) => s.k);
  let count = 0;

  // האינדקס הראשון שבו keys[i] >= v (או > v כש־strict)
  const bound = (v: number, strict: boolean) => {
    let lo = 0;
    let hi = keys.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      count++;
      if (strict ? keys[mid] <= v : keys[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const slice = (a: number, b: number) => sorted.slice(a, Math.max(a, b)).map((s) => s.row);

  return {
    eq: (v: number) => slice(bound(v, false), bound(v, true)),
    range: (from: number, to: number) => slice(bound(from, false), bound(to, false)),
    comparisons: () => count,
  };
}
