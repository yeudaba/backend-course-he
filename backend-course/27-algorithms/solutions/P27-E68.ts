// P27-E68: BFS אסינכרוני — סריקת קישורים עד עומק
export async function crawl(start: string, getLinks: (url: string) => Promise<string[]>, maxDepth: number) {
  const out = [{ url: start, depth: 0 }];
  const seen = new Set([start]);
  let level = [start];
  for (let depth = 0; depth < maxDepth && level.length; depth++) {
    const results = await Promise.all(level.map((u) => getLinks(u).catch(() => [] as string[])));
    const next: string[] = [];
    for (const links of results) {
      for (const link of links) {
        if (seen.has(link)) continue;
        seen.add(link);
        next.push(link);
        out.push({ url: link, depth: depth + 1 });
      }
    }
    level = next;
  }
  return out;
}
