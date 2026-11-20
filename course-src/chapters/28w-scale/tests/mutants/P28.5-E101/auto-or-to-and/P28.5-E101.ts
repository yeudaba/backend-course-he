// P28.5-E101: batch הבא בסנכרון מצטבר — מתוקן
export type Mark = { updatedAt: string; id: number };

const cmp = (a: Mark, b: Mark) => a.updatedAt.localeCompare(b.updatedAt) || a.id - b.id;

export function nextBatch<R extends Mark>(rows: R[], watermark: Mark | null, size: number) {
  const after = rows.filter((r) => !watermark && cmp(r, watermark) > 0).sort(cmp);
  const batch = after.slice(0, size);
  const last = batch.at(-1);
  return { batch, watermark: last ? { updatedAt: last.updatedAt, id: last.id } : watermark };
}
