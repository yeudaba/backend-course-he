// P27-E13
// ממיינים לפי התחלה (עותק!), ואז מעבר אחד: חופף לאחרון ← מאריכים אותו; אחרת ← מרווח חדש. O(n log n)
export function mergeIntervals(intervals: readonly (readonly [number, number])[]): [number, number][] {
  const sorted = [...intervals];
  const merged: [number, number][] = [];
  for (const [start, end] of sorted) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else merged.push([start, end]);
  }
  return merged;
}
