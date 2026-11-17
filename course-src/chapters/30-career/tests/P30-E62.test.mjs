import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { latencyClaim } = await load(import.meta.url, "P30-E62.ts");
const range = (n, f) => Array.from({ length: n }, (_, i) => f(i));

test("שיפור אמיתי", () => {
  const before = range(100, (i) => 70 + i * 0.5); // 70..119.5
  const after = range(100, (i) => (i < 95 ? 2 + (i % 3) : 40));
  const r = latencyClaim(before, after, "GET /products/search");
  assert.deepEqual(r, { p50Before: 95, p95Before: 117, p50After: 3, p95After: 4, speedup: 29.3, bullet: "Cut p95 latency of GET /products/search from 117 ms to 4 ms (29.3× faster)" });
});
test("nearest-rank, מיון מספרי, אין שיפור", () => {
  const r = latencyClaim([100, 9, 20, 30], [9, 100, 20, 30], "x");
  assert.deepEqual(r, { p50Before: 20, p95Before: 100, p50After: 20, p95After: 100, speedup: 1, bullet: null });
  assert.equal(latencyClaim([10], [12], "y").bullet, null, "האט — אין נקודה");
  assert.equal(latencyClaim([10.6], [5.4], "z").bullet, "Cut p95 latency of z from 11 ms to 5 ms (2.2× faster)");
});
test("שגיאות", () => {
  assert.throws(() => latencyClaim([], [1], "x"), RangeError);
  assert.throws(() => latencyClaim([1], [], "x"), RangeError);
  assert.throws(() => latencyClaim([10], [0.2], "x"), RangeError);
});
