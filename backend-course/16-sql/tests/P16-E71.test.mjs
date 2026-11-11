import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E71.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["aggregate"])).aggregate;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("מספרים עם null", async () => {
  const f = await get();
  assert.deepEqual(f([{ x: 10 }, { x: null }, { x: 20 }, {}], "x"), { count: 2, countAll: 4, sum: 30, avg: 15, min: 10, max: 20 });
  assert.deepEqual(f([{ x: -3 }, { x: 0 }, { x: 7.5 }], "x"), { count: 3, countAll: 3, sum: 4.5, avg: 1.5, min: -3, max: 7.5 });
  assert.deepEqual(f([{ x: 0 }], "x"), { count: 1, countAll: 1, sum: 0, avg: 0, min: 0, max: 0 }, "0 הוא ערך");
});
test("אין ערכים ← null", async () => {
  const f = await get();
  assert.deepEqual(f([], "x"), { count: 0, countAll: 0, sum: null, avg: null, min: null, max: null });
  assert.deepEqual(f([{ x: null }, { y: 1 }], "x"), { count: 0, countAll: 2, sum: null, avg: null, min: null, max: null });
});
test("מחרוזות", async () => {
  const f = await get();
  assert.deepEqual(f([{ d: "2026-03-05" }, { d: "2025-11-02" }, { d: null }, { d: "2026-09-14" }], "d"), { count: 3, countAll: 4, sum: null, avg: null, min: "2025-11-02", max: "2026-09-14" });
});
