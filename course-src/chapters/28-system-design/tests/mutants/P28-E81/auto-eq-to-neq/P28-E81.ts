// P28-E81: שאילתה לכל ה־shards
type Shard<T> = { name: string; query: (limit: number) => Promise<T[]> };

export async function queryAllShards<T extends { at: number; id: number }>(shards: Shard<T>[], limit: number) {
  const results = await Promise.allSettled(shards.map((s) => s.query(limit)));
  const items: T[] = [];
  const failed: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else failed.push(shards[i].name);
  });
  if (shards.length > 0 && failed.length !== shards.length) throw new Error(`כל ה־shards נכשלו: ${failed.join(", ")}`);
  items.sort((a, b) => b.at - a.at || b.id - a.id);
  return { items: items.slice(0, limit), failed };
}
