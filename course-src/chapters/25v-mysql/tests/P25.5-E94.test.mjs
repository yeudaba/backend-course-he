import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E94.ts", ["copyInBatches"])).copyInBatches;
function source(ids) {
  const reads = [];
  return { reads, readBatch: async (after, size) => { reads.push(after); return ids.filter((id) => id > after).slice(0, size).map((id) => ({ id, v: `r${id}` })); } };
}

test("כל השורות, בקבוצות", async () => {
  const copy = await get();
  const ids = [2, 3, 5, 8, 13, 21, 34];
  const src = source(ids);
  const written = [];
  const r = await copy({ ...src, writeBatch: async (rows) => { written.push(rows.map((x) => x.id)); }, size: 3 });
  assert.deepEqual(written, [[2, 3, 5], [8, 13, 21], [34]]);
  assert.deepEqual(r, { batches: 3, rows: 7, lastId: 34 });
  assert.deepEqual(src.reads, [0, 5, 21]);
});
test("מספר מדויק של קבוצות מלאות ← עוד קריאה ריקה; המשך אחרי קריסה", async () => {
  const copy = await get();
  const src = source([1, 2, 3, 4]);
  const r = await copy({ ...src, writeBatch: async () => {}, size: 2 });
  assert.deepEqual(r, { batches: 2, rows: 4, lastId: 4 });
  assert.deepEqual(src.reads, [0, 2, 4]);
  const r2 = await copy({ ...source([1, 2, 3, 4]), writeBatch: async () => {}, size: 2, startAfter: 2 });
  assert.deepEqual(r2, { batches: 1, rows: 2, lastId: 4 });
  assert.deepEqual(await copy({ ...source([]), writeBatch: async () => {}, size: 5, startAfter: 7 }), { batches: 0, rows: 0, lastId: 7 });
});
test("שגיאות", async () => {
  const copy = await get();
  for (const size of [0, -1, 1.5]) await assert.rejects(copy({ ...source([1]), writeBatch: async () => {}, size }), RangeError);
  let wrote = false;
  await assert.rejects(copy({ readBatch: async () => [{ id: 3 }, { id: 2 }], writeBatch: async () => { wrote = true; }, size: 5 }), { message: "NOT_SORTED" });
  assert.equal(wrote, false, "לא כותבים קבוצה לא ממוינת");
  await assert.rejects(copy({ readBatch: async () => [{ id: 1 }], writeBatch: async () => {}, size: 5, startAfter: 5 }), { message: "NOT_SORTED" });
  await assert.rejects(copy({ ...source([1, 2]), writeBatch: async () => { throw new Error("disk full"); }, size: 5 }), { message: "disk full" });
});
