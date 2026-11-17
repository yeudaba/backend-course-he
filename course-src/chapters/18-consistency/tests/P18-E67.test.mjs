import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P18-E67.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["createIndex"])).createIndex;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
  const p = typeProbe(import.meta.url, FILE, `import { createIndex } from "FILE";
const idx = createIndex([{ id: 1, total: 5 }], (r) => r.total);
const a: { id: number; total: number }[] = idx.eq(5);
const b: { id: number; total: number }[] = idx.range(1, 9);
const n: number = idx.comparisons();
// @ts-expect-error — eq מחזיר שורות מהטיפוס שנכנס, לא string
const s: string[] = idx.eq(5);
`);
  assert.ok(p.ok, p.message);
});
test("eq ו־range — כמו filter, ממוין ויציב", async () => {
  const createIndex = await get();
  const rows = [{ id: 1, v: 5 }, { id: 2, v: 3 }, { id: 3, v: 5 }, { id: 4, v: 9 }, { id: 5, v: 1 }, { id: 6, v: 5 }, { id: 7, v: 3 }];
  const copy = JSON.stringify(rows);
  const idx = createIndex(rows, (r) => r.v);
  assert.equal(JSON.stringify(rows), copy, "המערך המקורי לא השתנה");
  assert.deepEqual(idx.eq(5).map((r) => r.id), [1, 3, 6], "בשוויון — לפי הסדר המקורי");
  assert.deepEqual(idx.eq(3).map((r) => r.id), [2, 7]);
  assert.deepEqual(idx.eq(4), []);
  assert.deepEqual(idx.eq(100), []);
  assert.deepEqual(idx.eq(-1), []);
  assert.deepEqual(idx.range(3, 9).map((r) => r.id), [2, 7, 1, 3, 6], "from <= key < to");
  assert.deepEqual(idx.range(0, 100).map((r) => r.id), [5, 2, 7, 1, 3, 6, 4]);
  assert.deepEqual(idx.range(6, 9), []);
  assert.deepEqual(idx.range(9, 3), [], "טווח הפוך — ריק");
  assert.deepEqual(createIndex([], (r) => r).eq(1), []);
});
test("חיפוש בינארי: מעט השוואות על 100,000 שורות", async () => {
  const createIndex = await get();
  const rows = Array.from({ length: 100_000 }, (_, i) => ({ id: i, k: (i * 7919) % 50_000 }));
  const idx = createIndex(rows, (r) => r.k);
  const before = idx.comparisons();
  assert.equal(before, 0, "ההשוואות של המיון לא נספרות — רק של חיפושים");
  for (const k of [0, 12345, 49_999, 25_000, 60_000]) {
    const start = idx.comparisons();
    const found = idx.eq(k);
    const used = idx.comparisons() - start;
    assert.deepEqual(found.map((r) => r.id), rows.filter((r) => r.k === k).map((r) => r.id), `eq(${k})`);
    assert.ok(used > 0, "comparisons() סופרת את ההשוואות בחיפוש");
    assert.ok(used <= 40, `eq(${k}) עשה ${used} השוואות — צריך חיפוש בינארי (לכל היותר 40)`);
  }
  const start = idx.comparisons();
  assert.equal(idx.range(100, 200).length, 200);
  assert.ok(idx.comparisons() - start <= 40, "גם range — חיפוש בינארי");
});
