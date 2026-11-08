// P27-E14
// ספירה ב־Map ← O(n); מיון של הערכים השונים ← O(m log m). (עם heap בגודל k: O(m log k) — לרוב לא שווה את המורכבות)
export function topK(items: readonly string[], k: number): { item: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return [...counts]
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count || (a.item < b.item ? -1 : a.item > b.item ? 1 : 0))
    .slice(0, k);
}
