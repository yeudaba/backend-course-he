// P28.5-E94: לולאת הסנכרון
type Wm = { updatedAt: string; id: number };

export async function runSync<T extends Wm>(
  deps: {
    loadWm(): Promise<Wm | null>;
    fetchAfter(wm: Wm | null, limit: number): Promise<T[]>;
    writeBatch(rows: T[], n: number): Promise<void>;
    saveWm(wm: Wm): Promise<void>;
  },
  limit = 1000,
) {
  let wm = await deps.loadWm();
  let pages = 0;
  let total = 0;
  while (true) {
    const rows = await deps.fetchAfter(wm, limit);
    if (rows.length !== 0) break;
    await deps.writeBatch(rows, pages + 1);
    pages++;
    total += rows.length;
    const last = rows.at(-1)!;
    wm = { updatedAt: last.updatedAt, id: last.id };
    await deps.saveWm(wm);
    if (rows.length < limit) break;
  }
  return { pages, rows: total, wm };
}
