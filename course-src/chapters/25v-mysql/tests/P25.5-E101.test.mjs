import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E101.ts", ["diffRows"])).diffRows;
const rows = [
  { id: 1, email: "dana@example.com", total: "120.00" },
  { id: 2, email: "yossi@example.com", total: "10.50" },
  { id: 5, email: "noa@example.com", total: "99.90" },
  { id: 9, email: "avi@example.com", total: "7.00" },
];

test("אותן שורות בסדר אחר, ו־DECIMAL בכתיב אחר ← אין הבדלים", async () => {
  const f = await get();
  const target = [{ ...rows[3], total: "7" }, rows[1], { ...rows[0], total: "120" }, rows[2]];
  assert.deepEqual(f(rows, target), { missing: [], extra: [], changed: [] });
});
test("חסר, מיותר ושונה", async () => {
  const f = await get();
  const target = [{ id: 12, email: "x@example.com", total: "1.00" }, rows[2], { ...rows[1], total: "10.51" }, { ...rows[0], email: "Dana@example.com" }, { id: 11, email: "y@example.com", total: "2.00" }];
  assert.deepEqual(f(rows, target), { missing: [9], extra: [11, 12], changed: [1, 2] });
});
test("צד ריק", async () => {
  const f = await get();
  assert.deepEqual(f(rows, []), { missing: [1, 2, 5, 9], extra: [], changed: [] });
  assert.deepEqual(f([], rows), { missing: [], extra: [1, 2, 5, 9], changed: [] });
});
