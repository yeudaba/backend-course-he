// P27-E20
export function lowerBound(sorted: readonly number[], x: number): number {
  let lo = 0;
  let hi = sorted.length; // תקלה 1: היה length − 1 ← "כולם קטנים" החזיר את האינדקס האחרון במקום length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < x) lo = mid + 1; // תקלה 2: היה <= ← זה upper bound (הראשון שגדול מ־x), לא הראשון שגדול או שווה
    else hi = mid;
  }
  return lo;
}

export function countInRange(sorted: readonly number[], from: number, to: number): number {
  if (from > to) return 0;
  return lowerBound(sorted, to + 1) - lowerBound(sorted, from); // תקלה 3: היה lowerBound(to) ← ערכים ששווים ל־to לא נספרו
}
