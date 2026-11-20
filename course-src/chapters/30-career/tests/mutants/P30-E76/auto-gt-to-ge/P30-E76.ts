// P30-E76: בנק סיפורים לשאלות התנהגותיות
type Item = { id: string; tags: string[] };

export function assignStories(questions: Item[], stories: Item[], maxUses = 2): Record<string, string | null> {
  const uses = new Map<string, number>(stories.map((s) => [s.id, 0]));
  const out: Record<string, string | null> = {};
  for (const q of questions) {
    let best: { s: Item; shared: number; used: number } | null = null;
    for (const s of stories) {
      const shared = s.tags.filter((t) => q.tags.includes(t)).length;
      const used = uses.get(s.id)!;
      if (shared === 0 || used >= maxUses) continue;
      if (!best || shared >= best.shared || (shared === best.shared && used < best.used)) best = { s, shared, used };
    }
    out[q.id] = best ? best.s.id : null;
    if (best) uses.set(best.s.id, best.used + 1);
  }
  return out;
}
