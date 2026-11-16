import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { growthClass } = await load(import.meta.url, "P30-E82.ts");
const NS = [10, 100, 1000, 10000, 100000];
const ops = (f) => NS.map(f);

test("מזהה כל צורה", () => {
  assert.equal(growthClass(NS, ops(() => 7)), "O(1)");
  assert.equal(growthClass(NS, ops((n) => Math.ceil(Math.log2(n)) + 1)), "O(log n)");
  assert.equal(growthClass(NS, ops((n) => 3 * n + 5)), "O(n)");
  assert.equal(growthClass(NS, ops((n) => Math.round(n * Math.log2(n) * 1.4))), "O(n log n)");
  assert.equal(growthClass(NS, ops((n) => (n * (n - 1)) / 2)), "O(n^2)");
});
test("שגיאות", () => {
  assert.throws(() => growthClass([10], [1]), RangeError);
  assert.throws(() => growthClass([10, 20], [1]), RangeError);
  assert.throws(() => growthClass([1, 20], [1, 2]), RangeError);
  assert.throws(() => growthClass([10, 20], [0, 2]), RangeError);
  assert.equal(growthClass([2, 4], [5, 5]), "O(1)", "תיקו ← הראשון");
});
