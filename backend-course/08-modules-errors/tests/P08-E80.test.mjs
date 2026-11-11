import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E80.js";
const get = () => exportsOf(import.meta.url, FILE, ["shrink"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const zeroAndNegative = (arr) => arr.includes(0) && arr.some((n) => n < 0);
test("מצמצם לקלט מינימלי", async () => {
  const { shrink } = await get();
  assert.deepEqual(shrink([5, 0, 8, -3, 2, 0, 7], zeroAndNegative), [-3, 0]);
  assert.deepEqual(shrink([1, 2, 3, 99, 4], (a) => a.includes(99)), [99]);
});
test("תנאי שתלוי בכמה איברים", async () => {
  const { shrink } = await get();
  assert.deepEqual(shrink([3, 9, 1, 7, 5], (a) => a.reduce((s, n) => s + n, 0) > 15), [9, 7], "הסכום צריך להישאר מעל 15");
  assert.deepEqual(shrink([2, 2, 2, 2], (a) => a.length >= 3), [2, 2, 2]);
});
test("כבר מינימלי — נשאר כמו שהוא", async () => {
  const { shrink } = await get();
  assert.deepEqual(shrink([0, -1], zeroAndNegative), [0, -1]);
});
test("הקלט לא משתנה, והתוצאה עדיין נכשלת", async () => {
  const { shrink } = await get();
  const input = [5, 0, 8, -3];
  const r = shrink(input, zeroAndNegative);
  assert.deepEqual(input, [5, 0, 8, -3]);
  assert.equal(zeroAndNegative(r), true);
});
