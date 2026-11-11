// P27-E26 — הראשון שמופיע פעם אחת בלבד
export function firstUnique<T>(items: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  for (const item of items) if (counts.get(item) === 1) return item;
  return undefined;
}

console.log(firstUnique(["10.0.0.5", "10.0.0.7", "10.0.0.5", "10.0.0.9", "10.0.0.7"]));
console.log(firstUnique([..."swiss"]), firstUnique([1, 1, 2, 2]), firstUnique([0, 1, 1]));
