// P28-E102: מיזוג פידים — מתוקן
export type Post = { id: number; createdAt: string; shop: string };

export function mergeFeeds(lists: Post[][], limit: number): Post[] {
  const all = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt) && b.id - a.id);
  const seen = new Set<number>();
  const out: Post[] = [];
  for (const p of all) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    out.push(p);
    if (out.length === limit) break;
  }
  return out;
}
