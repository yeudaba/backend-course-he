import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P28.5-E101.ts", ["nextBatch"])).nextBatch;
const T = (s) => `2026-11-20 10:00:00.${s}+00`;

function drain(f, rows, size) {
  const out = [];
  let wm = null;
  for (let guard = 0; guard < 50; guard++) {
    const r = f(rows, wm, size);
    if (r.batch.length === 0) {
      assert.deepEqual(r.watermark, wm, "batch ריק — ה־watermark לא זז");
      break;
    }
    out.push(...r.batch.map((x) => x.id));
    wm = r.watermark;
  }
  return out;
}

test("כל השורות בדיוק פעם אחת, גם בתיקו וגם מעבר ל־size", async () => {
  const f = await get();
  const rows = [
    { id: 5, updatedAt: T("000200") }, { id: 1, updatedAt: T("000100") }, { id: 9, updatedAt: T("000100") },
    { id: 3, updatedAt: T("000100") }, { id: 2, updatedAt: T("000300") }, { id: 7, updatedAt: T("000200") },
  ];
  assert.deepEqual(drain(f, rows, 2), [1, 3, 9, 5, 7, 2]);
  assert.deepEqual(drain(f, rows, 4), [1, 3, 9, 5, 7, 2]);
  assert.deepEqual(drain(f, rows, 10), [1, 3, 9, 5, 7, 2]);
});
test("watermark של השורה האחרונה ב־batch", async () => {
  const f = await get();
  const rows = [{ id: 1, updatedAt: T("1") }, { id: 2, updatedAt: T("2") }, { id: 3, updatedAt: T("3") }];
  assert.deepEqual(f(rows, null, 2), { batch: [rows[0], rows[1]], watermark: { updatedAt: T("2"), id: 2 } });
  assert.deepEqual(f(rows, { updatedAt: T("3"), id: 3 }, 2), { batch: [], watermark: { updatedAt: T("3"), id: 3 } });
});
