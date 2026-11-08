// P27-E10
// חיפוש בינארי: הטווח [lo, hi) תמיד מכיל את התשובה, וחוצים אותו בכל צעד ← O(log n)
export function lowerBound(sorted: readonly number[], x: number): number {
  let lo = 0;
  let hi = sorted.length; // התשובה יכולה להיות length: "כולם קטנים מ־x"
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// כמה ערכים ב־[from, to] — שני חיפושים בינאריים
export function countInRange(sorted: readonly number[], from: number, to: number): number {
  if (from > to) return 0;
  return lowerBound(sorted, to + 1) - lowerBound(sorted, from);
}
