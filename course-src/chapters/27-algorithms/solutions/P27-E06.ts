// P27-E06
// Set: "ראיתי כבר?" ב־O(1). מעבר אחד על המערך ← O(n) זמן, O(n) זיכרון
export function firstDuplicate<T>(items: readonly T[]): T | undefined {
  const seen = new Set<T>();
  for (const item of items) {
    if (seen.has(item)) return item;
    seen.add(item);
  }
  return undefined;
}

export function hasDuplicates<T>(items: readonly T[]): boolean {
  return new Set(items).size !== items.length;
}
