// P28-E89: מיזוג פידים
type Post = { id: number; at: number };

const newer = (a: Post, b: Post) => a.at > b.at || (a.at === b.at && a.id > b.id);

export function mergeFeeds(lists: Post[][], limit: number): Post[] {
  const pos = lists.map(() => 0);
  const seen = new Set<number>();
  const out: Post[] = [];
  while (out.length < limit) {
    let best = -1;
    for (let i = 0; i <= lists.length; i++) {
      const head = lists[i][pos[i]];
      if (head && (best === -1 || newer(head, lists[best][pos[best]]))) best = i;
    }
    if (best === -1) break;
    const post = lists[best][pos[best]++];
    if (seen.has(post.id)) continue;
    seen.add(post.id);
    out.push(post);
  }
  return out;
}
