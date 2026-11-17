import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P11-E36.ts";
const get = () => exportsOf(import.meta.url, FILE, ["average", "above"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("החתימות", () => {
  const r = typeProbe(import.meta.url, FILE, `import { average, above } from "FILE";
const a: number = average([1, 2]);
const b: number[] = above([1, 2], 1);
// @ts-expect-error — average מקבלת מערך של מספרים
average(["1", "2"]);
// @ts-expect-error — above מחזירה number[], לא string[]
const c: string[] = above([1], 0);
// @ts-expect-error — limit הוא number
above([1], "0");
export { a, b, c };
`);
  assert.ok(r.ok, r.message);
});
test("average", async () => {
  const { average } = await get();
  assert.equal(average([90, 85, 77]), 84);
  assert.equal(average([]), 0, "מערך ריק ← 0 (לא NaN)");
  assert.equal(average([1, 2]), 1.5);
  assert.equal(average([1, 1, 2]), 1.33);
  assert.equal(average([-4]), -4);
});
test("above שומרת על הסדר ולא משנה את המקור", async () => {
  const { above } = await get();
  const nums = [5, 12, 8, 30];
  assert.deepEqual(above(nums, 8), [12, 30]);
  assert.deepEqual(above(nums, 100), []);
  assert.deepEqual(above([3, -1, 0], -1), [3, 0]);
  assert.deepEqual(nums, [5, 12, 8, 30]);
});
