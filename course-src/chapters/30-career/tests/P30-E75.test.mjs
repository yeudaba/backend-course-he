import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { allocateSeconds } = await load(import.meta.url, "P30-E75.ts");

test("החלוקה של ה־pitch", () => {
  assert.deepEqual(allocateSeconds({ what: 1, built: 1, problem: 5, more: 2, next: 1 }, 120), { what: 12, built: 12, problem: 60, more: 24, next: 12 });
});
test("largest remainder, בסכום מדויק", () => {
  const r = allocateSeconds({ a: 1, b: 1, c: 1 }, 100);
  assert.deepEqual(r, { a: 34, b: 33, c: 33 }, "תיקו ← לפי הסדר");
  assert.deepEqual(Object.keys(r), ["a", "b", "c"]);
  assert.deepEqual(allocateSeconds({ x: 2, y: 3, z: 5 }, 7), { x: 1, y: 2, z: 4 });
  assert.deepEqual(allocateSeconds({ x: 0, y: 1 }, 5), { x: 0, y: 5 });
  assert.deepEqual(allocateSeconds({ a: 1, b: 2 }, 0), { a: 0, b: 0 });
  const big = allocateSeconds({ a: 1.5, b: 2.25, c: 0.75, d: 3 }, 61);
  assert.equal(Object.values(big).reduce((s, x) => s + x, 0), 61);
});
test("שגיאות", () => {
  assert.throws(() => allocateSeconds({ a: 0, b: 0 }, 10), RangeError);
  assert.throws(() => allocateSeconds({}, 10), RangeError);
  assert.throws(() => allocateSeconds({ a: -1, b: 2 }, 10), RangeError);
  assert.throws(() => allocateSeconds({ a: NaN }, 10), RangeError);
  assert.throws(() => allocateSeconds({ a: 1 }, 10.5), RangeError);
  assert.throws(() => allocateSeconds({ a: 1 }, -1), RangeError);
});
