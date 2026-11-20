// P30-E82: O(?) מתוך מדידות
type Cls = "O(1)" | "O(log n)" | "O(n)" | "O(n log n)" | "O(n^2)";

const F: [Cls, (n: number) => number][] = [
  ["O(1)", () => 1],
  ["O(log n)", (n) => Math.log2(n)],
  ["O(n)", (n) => n],
  ["O(n log n)", (n) => n * Math.log2(n)],
  ["O(n^2)", (n) => n * n],
];

export function growthClass(ns: number[], ops: number[]): Cls {
  if (ns.length !== ops.length || ns.length < 2) throw new RangeError("צריך לפחות שתי מדידות, באותו אורך");

  let best: Cls = F[0][0];
  let bestSpread = Infinity;
  for (const [name, f] of F) {
    const ratios = ns.map((n, i) => ops[i] / f(n));
    const spread = Math.max(...ratios) / Math.min(...ratios);
    if (spread < bestSpread) {
      best = name;
      bestSpread = spread;
    }
  }
  return best;
}
