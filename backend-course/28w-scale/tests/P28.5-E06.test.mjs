import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { percentile, summarize } = await load(import.meta.url, "P28.5-E06.ts");

test("percentile: nearest-rank", () => {
  const s = Array.from({ length: 100 }, (_, i) => i + 1); // 1..100
  assert.equal(percentile(s, 50), 50);
  assert.equal(percentile(s, 95), 95);
  assert.equal(percentile(s, 99), 99);
  assert.equal(percentile(s, 100), 100);
  assert.equal(percentile([7], 99), 7);
  assert.equal(percentile([1, 2, 3, 4, 5], 50), 3);
  assert.throws(() => percentile([], 50));
  assert.throws(() => percentile([1], 0));
});
test("summarize: עותק ממוין מספרית — ו־p99 שהממוצע מסתיר", () => {
  const samples = [...Array(97).fill(20), 900, 1200, 15];
  const before = [...samples];
  const s = summarize(samples);
  assert.deepEqual(samples, before, "לא משנה את המערך שקיבלה");
  assert.deepEqual(s, { count: 100, min: 15, max: 1200, mean: 40.55, p50: 20, p95: 20, p99: 900 });
});
test("מיון מספרי, לא מילוני", () => {
  assert.equal(summarize([100, 9, 25, 3]).max, 100);
  assert.equal(summarize([100, 9, 25, 3]).min, 3);
});
