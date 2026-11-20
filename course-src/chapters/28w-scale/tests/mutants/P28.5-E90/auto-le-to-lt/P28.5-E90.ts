// P28.5-E90: הגרסה האחרונה של כל רשומה
export function latestVersions<T extends { id: number; updatedAt: string }>(records: T[], asOf?: string): T[] {
  const limit = asOf === undefined ? Infinity : Date.parse(asOf);
  const best = new Map<number, T>();
  for (const r of records) {
    const t = Date.parse(r.updatedAt);
    if (t > limit) continue;
    const cur = best.get(r.id);
    if (!cur || Date.parse(cur.updatedAt) < t) best.set(r.id, r);
  }
  return [...best.values()].sort((a, b) => a.id - b.id);
}
