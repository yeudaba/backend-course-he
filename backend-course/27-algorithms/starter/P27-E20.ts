// P27-E20: "החיפוש מחזיר אינדקס לא נכון, והספירה מפספסת" — שלוש תקלות
export function lowerBound(sorted: readonly number[], x: number): number {
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function countInRange(sorted: readonly number[], from: number, to: number): number {
  if (from > to) return 0;
  return lowerBound(sorted, to) - lowerBound(sorted, from);
}
