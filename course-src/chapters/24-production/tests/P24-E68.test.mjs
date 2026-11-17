import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P24-E68.ts", ["suspectedDuplicates"])).suspectedDuplicates;
const t = (s) => new Date(Date.UTC(2026, 10, 7, 12, 0, 0) + s * 1000).toISOString();
const p = (id, userId, amountCents, s) => ({ id, userId, amountCents, createdAt: t(s) });

test("שרשרת אחת, משתמש אחר וסכום אחר", async () => {
  const f = await get();
  const input = [p(1, 1, 4990, 0), p(2, 1, 4990, 40), p(3, 2, 4990, 41), p(4, 1, 4990, 80), p(5, 1, 5000, 81)];
  assert.deepEqual(f(input, 60_000), [[1, 2, 4]]);
});
test("בדיוק בגבול — לא כפול; לא ממוין; כמה קבוצות", async () => {
  const f = await get();
  const input = [p(9, 3, 100, 500), p(1, 1, 4990, 0), p(2, 1, 4990, 60), p(7, 3, 100, 450), p(3, 2, 700, 10), p(4, 2, 700, 15), p(8, 3, 100, 520)];
  const copy = structuredClone(input);
  assert.deepEqual(f(input, 60_000), [[3, 4], [7, 9, 8]], "60 שניות בדיוק — לא; הקבוצות לפי זמן הראשון");
  assert.deepEqual(input, copy, "הקלט לא השתנה");
});
test("אותו זוג, שתי קבוצות נפרדות", async () => {
  const f = await get();
  const input = [p(1, 1, 10, 0), p(2, 1, 10, 5), p(3, 1, 10, 1000), p(4, 1, 10, 1001), p(5, 1, 10, 3000)];
  assert.deepEqual(f(input, 10_000), [[1, 2], [3, 4]]);
  assert.deepEqual(f([], 1000), []);
  assert.deepEqual(f([p(1, 1, 10, 0)], 1000), []);
});
