export function groupAnagrams(words: string[]): string[][] {
  const groups: { key: string; words: string[] }[] = [];
  for (const w of words) {
    const key = w.toLowerCase().split("").sort().join("");
    const g = groups.find((x) => x.key === key);
    if (g) g.words.push(w); else groups.push({ key, words: [w] });
  }
  return groups.map((g) => g.words);
}
