import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { intersection } = await load(import.meta.url, "P27-E37.ts");

test("כל אחד פעם אחת, לפי הסדר של a", () => {
  assert.deepEqual(intersection([3, 1, 3, 2, 5], [5, 3, 3, 9]), [3, 5]);
  assert.deepEqual(intersection(["a"], []), []);
  const b = [1, 2];
  intersection([1], b);
  assert.deepEqual(b, [1, 2], "לא משנה את הקלט");
});
test("200,000 — מהר", () => {
  const a = Array.from({ length: 200_000 }, (_, i) => i);
  const b = Array.from({ length: 200_000 }, (_, i) => i * 3);
  assert.equal(fastEnough(() => intersection(a, b), 200, "intersection").length, 66_667);
});
