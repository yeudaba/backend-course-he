// P25.5-E94: העברה בקבוצות — עם המשך
export async function copyInBatches<R extends { id: number }>({ readBatch, writeBatch, size, startAfter = 0 }: {
  readBatch: (afterId: number, size: number) => Promise<R[]>;
  writeBatch: (rows: R[]) => Promise<void>;
  size: number;
  startAfter?: number;
}) {
  if (!Number.isInteger(size) || size <= 0) throw new RangeError(`size לא תקין: ${size}`);
  let after = startAfter;
  let batches = 0;
  let rows = 0;
  for (;;) {
    const batch = await readBatch(after, size);
    if (batch.length === 0) break;
    if (!batch.every((r, i) => r.id > (i === 0 ? after : batch[i - 1].id))) throw new Error("NOT_SORTED");
    await writeBatch(batch);
    batches++;
    rows += batch.length;
    after = batch[batch.length - 1].id;
    if (batch.length < size) break;
  }
  return { batches, rows, lastId: after };
}
