import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { backoffDelays, giveUpAfter } = await load(import.meta.url, "P26-E76.ts");

test("exponential", () => {
  assert.deepEqual(backoffDelays(5, 1000, "exponential"), [1000, 2000, 4000, 8000]);
  assert.equal(giveUpAfter(5, 1000, "exponential"), 15000);
  assert.deepEqual(backoffDelays(3, 200, "exponential"), [200, 400]);
  assert.equal(giveUpAfter(11, 1000, "exponential"), 1023000);
});
test("fixed", () => {
  assert.deepEqual(backoffDelays(4, 500, "fixed"), [500, 500, 500]);
  assert.equal(giveUpAfter(4, 500, "fixed"), 1500);
});
test("ניסיון אחד — אין המתנות; delay 0", () => {
  assert.deepEqual(backoffDelays(1, 1000, "exponential"), []);
  assert.equal(giveUpAfter(1, 1000, "fixed"), 0);
  assert.deepEqual(backoffDelays(3, 0, "exponential"), [0, 0]);
});
test("קלט לא תקין ← RangeError", () => {
  for (const [a, d] of [[0, 100], [-1, 100], [2.5, 100], [3, -1], [3, NaN]]) {
    assert.throws(() => backoffDelays(a, d, "fixed"), RangeError, `attempts=${a}, delay=${d}`);
  }
});
