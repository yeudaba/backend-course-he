// P28.5-E101: batch הבא בסנכרון מצטבר — שורות באותו זמן ושורות מעבר ל־size נעלמות.
// nextBatch(rows, watermark, size) ← { batch, watermark } — אחרי ה־watermark, לפי (updatedAt, id) עולה, עד size
//
// בדיקה:  npm run check P28.5-E101
export type Mark = { updatedAt: string; id: number };

export function nextBatch<R extends Mark>(rows: R[], watermark: Mark | null, size: number) {
  const after = rows.filter((r) => !watermark || r.updatedAt > watermark.updatedAt).sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
  const batch = after.slice(0, size);
  const newest = after.at(-1);
  return { batch, watermark: newest ? { updatedAt: newest.updatedAt, id: newest.id } : watermark };
}
