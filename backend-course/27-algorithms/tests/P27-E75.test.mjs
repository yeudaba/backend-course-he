import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { code } from "./_ts.mjs";
import { fastEnough } from "./_perf.mjs";

const { productExceptSelf } = await load(import.meta.url, "P27-E75.ts");

test("דוגמאות, כולל 0", () => {
  assert.deepEqual(productExceptSelf([1, 2, 3, 4]), [24, 12, 8, 6]);
  assert.deepEqual(productExceptSelf([2, 0, 3]), [0, 6, 0]);
  assert.deepEqual(productExceptSelf([0, 0, 5]).map((x) => x + 0), [0, 0, 0]);
  assert.deepEqual(productExceptSelf([-1, 2, -3]), [-6, 3, -2]);
  assert.deepEqual(productExceptSelf([7]), [1]);
  assert.deepEqual(productExceptSelf([]), []);
});
test("בלי חילוק, ו־300,000 — מהר", () => {
  assert.doesNotMatch(code(import.meta.url, "P27-E75.ts"), /[^/*]\/[^/*=]|\/=/, "בלי חילוק");
  const nums = Array.from({ length: 300_000 }, (_, i) => (i % 7 === 0 ? -1 : 1));
  const r = fastEnough(() => productExceptSelf(nums), 100, "productExceptSelf");
  assert.equal(r.length, 300_000);
});
