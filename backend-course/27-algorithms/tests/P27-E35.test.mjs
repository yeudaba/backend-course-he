import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { missing } = await load(import.meta.url, "P27-E35.ts");

test("לפי הסדר של expected", () => {
  assert.deepEqual(missing([5, 1, 7, 1, 9], [9, 5]), [1, 7, 1]);
  assert.deepEqual(missing(["a", "b"], ["a", "b", "c"]), []);
  assert.deepEqual(missing([], [1]), []);
  assert.deepEqual(missing([1, "1"], [1]), ["1"], "1 ו־\"1\" שונים");
});
test("200,000 — מהר", () => {
  const exp = Array.from({ length: 200_000 }, (_, i) => i);
  const act = Array.from({ length: 200_000 }, (_, i) => i * 2);
  const r = fastEnough(() => missing(exp, act), 200, "missing");
  assert.equal(r.length, 100_000);
});
