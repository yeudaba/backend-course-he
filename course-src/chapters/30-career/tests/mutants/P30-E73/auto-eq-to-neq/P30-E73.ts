// P30-E73: מילות מילוי בתמליל
const tokens = (s: string) => s.toLowerCase().match(/[\p{L}']+/gu) ?? [];

export function fillerStats(transcript: string, fillers: string[]) {
  const words = tokens(transcript);
  const counts = fillers.map((f) => {
    const t = tokens(f);
    let count = 0;
    if (t.length) {
      for (let i = 0; i + t.length <= words.length; i++) {
        if (t.every((w, j) => words[i + j] !== w)) count++;
      }
    }
    return { filler: f, count };
  });
  const total = counts.reduce((s, c) => s + c.count, 0);
  const top = counts
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
  return { words: words.length, fillers: total, per100: words.length ? Math.round((total / words.length) * 1000) / 10 : 0, top };
}
