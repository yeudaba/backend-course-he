import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { fastEnough } from "./_perf.mjs";

const FILE = "P27-E26.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["firstUnique"])).firstUnique;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הראשון (לפי הסדר במערך) שמופיע פעם אחת בדיוק", async () => {
  const firstUnique = await get();
  assert.equal(firstUnique(["10.0.0.5", "10.0.0.7", "10.0.0.5", "10.0.0.9", "10.0.0.7"]), "10.0.0.9");
  assert.equal(firstUnique([..."swiss"]), "w");
  assert.equal(firstUnique(["b", "a", "b"]), "a");
  assert.equal(firstUnique([3, 3, 3, 1, 2]), 1, "3 מופיע שלוש פעמים — לא 'פעם שנייה' בלבד");
  assert.equal(firstUnique([1, 1, 2, 2]), undefined);
  assert.equal(firstUnique([]), undefined);
  assert.equal(firstUnique([0, 1, 1]), 0, "0 הוא ערך — לא 'אין'");
  assert.equal(firstUnique(["", "x", "x"]), "");
});
test("100,000 ערכים — מהר (O(n))", async () => {
  const firstUnique = await get();
  const big = [];
  for (let i = 0; i < 50_000; i++) big.push(i, i);
  big.push(-1);
  fastEnough(() => assert.equal(firstUnique(big), -1), 300, "firstUnique על 100,001 ערכים");
});
