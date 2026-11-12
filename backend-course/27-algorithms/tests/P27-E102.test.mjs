import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { percentiles } = await load(import.meta.url, "P27-E102.ts");

test("nearest rank", () => {
  const l = [...Array(99).fill(20), 5000];
  assert.deepEqual(percentiles(l, [50, 95, 99, 100]), { p50: 20, p95: 20, p99: 20, p100: 5000 });
  assert.deepEqual(percentiles([3, 1, 2, 10], [25, 50, 75, 99.9]), { p25: 1, p50: 2, p75: 3, "p99.9": 10 });
  assert.deepEqual(percentiles([100, 9], [50]), { p50: 9 }, "מספרים, לא מחרוזות");
  assert.deepEqual(percentiles([], [50, 99]), { p50: null, p99: null });
  const input = [3, 1, 2];
  percentiles(input, [50]);
  assert.deepEqual(input, [3, 1, 2], "לא ממיינים את הקלט");
  for (const bad of [0, -1, 101, NaN]) assert.throws(() => percentiles([1], [bad]), RangeError);
});
test("1,000,000 — מהר", () => {
  const rnd = seeded(2);
  const l = Array.from({ length: 1_000_000 }, () => Math.floor(rnd() * 1000));
  const r = fastEnough(() => percentiles(l, [50, 95, 99]), 500, "percentiles");
  assert.ok(r.p50 >= 450 && r.p50 <= 550);
});
