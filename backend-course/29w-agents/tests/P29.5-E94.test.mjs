import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { passAtK, passHatK } = await load(import.meta.url, "P29.5-E94.ts");

test("ערכים ידועים", () => {
  assert.equal(passAtK(3, 2, 1), 0.6667);
  assert.equal(passHatK(3, 2, 1), 0.6667);
  assert.equal(passAtK(3, 2, 2), 1);
  assert.equal(passHatK(3, 2, 2), 0.3333);
  assert.equal(passHatK(3, 2, 3), 0);
  assert.equal(passAtK(10, 9, 3), 1);
  assert.equal(passHatK(10, 9, 3), 0.7);
  assert.equal(passAtK(10, 1, 3), 0.3);
  assert.equal(passAtK(5, 0, 5), 0);
  assert.equal(passHatK(5, 5, 5), 1);
});
test("מספרים גדולים — בלי עצרות", () => {
  assert.equal(passHatK(100, 90, 10), 0.3305);
  assert.equal(passAtK(100, 10, 50), 0.9994);
  assert.equal(passHatK(1000, 999, 500), 0.5);
});
test("קלט לא תקין", () => {
  for (const [n, c, k] of [[3, 4, 1], [3, -1, 1], [3, 2, 0], [3, 2, 4], [3.5, 2, 1], [3, 2, NaN]]) {
    assert.throws(() => passAtK(n, c, k), RangeError, `${n},${c},${k}`);
    assert.throws(() => passHatK(n, c, k), RangeError);
  }
});
