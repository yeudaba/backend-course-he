// P28.5-E89: השוואת watermarks
export type Watermark = { updatedAt: string; id: number };

export function compareWm(a: Watermark, b: Watermark): number {
  return Date.parse(a.updatedAt) - Date.parse(b.updatedAt) || a.id - b.id;
}

export function changesAfter<T extends Watermark>(rows: T[], wm: Watermark | null, limit: number) {
  const page = rows
    .filter((r) => wm === null || compareWm(r, wm) > 0)
    .sort(compareWm)
    .slice(0, limit);
  const last = page.at(-1);
  return { page, next: last ? { updatedAt: last.updatedAt, id: last.id } : wm };
}
