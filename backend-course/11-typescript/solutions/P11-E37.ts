// P11-E37: ספירת מילים ב־Map מוקלד
export function countWords(text: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const raw of text.split(" ")) {
    if (raw === "") continue;
    const w = raw.toLowerCase();
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  return counts;
}

console.log(countWords("the cat and The dog"));
console.log(countWords("   "));
