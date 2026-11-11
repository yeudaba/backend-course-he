// P11-E43: קבוצות לפי אורך
export function byLength(words: string[]): Map<number, string[]> {
  const groups = new Map<number, string[]>();
  for (const w of words) {
    const list = groups.get(w.length) ?? [];
    list.push(w);
    groups.set(w.length, list);
  }
  const sorted = new Map<number, string[]>();
  for (const k of [...groups.keys()].sort((a, b) => a - b)) {
    sorted.set(k, groups.get(k) ?? []);
  }
  return sorted;
}

console.log(byLength(["cat", "a", "dog", "bird", "be"]));
