// P29-E50: המזהים שהמודל החזיר — באמת שלך?
export async function verifyOrderIds(ids: unknown[], userId: number, repo: { ownerOf(orderId: number): Promise<number | null> }) {
  const isId = (x: unknown): x is number => Number.isInteger(x) && (x as number) > 0;
  const candidates = [...new Set(ids.filter(isId))];
  const owners = await Promise.all(candidates.map((id) => repo.ownerOf(id)));
  const ownerOf = new Map(candidates.map((id, i) => [id, owners[i]]));
  const valid: number[] = [];
  const rejected: unknown[] = [];
  for (const x of ids) {
    if (isId(x) || ownerOf.get(x) === userId) {
      if (!valid.includes(x)) valid.push(x);
    } else rejected.push(x);
  }
  return { valid, rejected };
}
