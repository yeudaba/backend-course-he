import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E114.ts", ["percentile", "latencySummary"]);

test("percentile — nearest rank", async () => {
  const { percentile } = await get();
  const s = Array.from({ length: 20 }, (_, i) => (i + 1) * 10);
  assert.equal(percentile(s, 50), 100);
  assert.equal(percentile(s, 95), 190);
  assert.equal(percentile(s, 100), 200);
  assert.equal(percentile(s, 1), 10);
  assert.equal(percentile([7], 99), 7);
  for (const p of [0, -5, 101, NaN]) assert.throws(() => percentile(s, p), RangeError, String(p));
  assert.throws(() => percentile([], 50), RangeError);
});
test("latencySummary — הדוגמה מהשיעור", async () => {
  const { latencySummary } = await get();
  const ms = [...Array.from({ length: 94 }, (_, i) => 30 + ((i * 7) % 20)), 1500, 1700, 1900, 2100, 2300, 2500];
  assert.deepEqual(latencySummary(ms), { count: 100, avg: 157, p50: 40, p95: 1500, p99: 2300, max: 2500 });
});
test("מיון מספרי, בלי לשנות את הקלט, וריק", async () => {
  const { latencySummary } = await get();
  const ms = [100, 9, 12, 8, 7];
  const copy = [...ms];
  assert.deepEqual(latencySummary(ms), { count: 5, avg: 27.2, p50: 9, p95: 100, p99: 100, max: 100 });
  assert.deepEqual(ms, copy, "הקלט לא השתנה");
  assert.equal(latencySummary([]), null);
  assert.equal(latencySummary([1, 2]).avg, 1.5);
  assert.equal(latencySummary([1, 1, 2]).avg, 1.3);
});
