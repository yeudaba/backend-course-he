import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { serversNeeded } = await load(import.meta.url, "P28-E36.ts");

test("חישוב עם מרווח ועיגול למעלה", () => {
  assert.equal(serversNeeded(3500, 1000), 5);
  assert.equal(serversNeeded(3501, 1000), 6);
  assert.equal(serversNeeded(10_000, 1000, 0), 10);
  assert.equal(serversNeeded(10_000, 1000, 0.5), 20);
  assert.equal(serversNeeded(34_722, 2000, 0.2), 22);
});
test("לפחות 2", () => {
  assert.equal(serversNeeded(3, 1000), 2);
  assert.equal(serversNeeded(0, 1000), 2);
});
test("קלט לא תקין ← RangeError", () => {
  assert.throws(() => serversNeeded(100, 0), RangeError);
  assert.throws(() => serversNeeded(100, -5), RangeError);
  assert.throws(() => serversNeeded(-1, 100), RangeError);
  assert.throws(() => serversNeeded(100, 100, 1), RangeError);
  assert.throws(() => serversNeeded(100, 100, -0.1), RangeError);
  assert.throws(() => serversNeeded(NaN, 100), RangeError);
});
