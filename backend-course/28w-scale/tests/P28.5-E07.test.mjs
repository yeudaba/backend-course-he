import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { createHistogram, record, merge, histPercentile } = await load(import.meta.url, "P28.5-E07.ts");
let seed = 7;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const exact = (arr, p) => [...arr].sort((a, b) => a - b)[Math.ceil((p / 100) * arr.length) - 1];

test("percentile מ־histogram — בתוך 10% מהמדויק", () => {
  const xs = Array.from({ length: 20000 }, () => (rand() < 0.97 ? 5 + rand() * 40 : 200 + rand() * 3000));
  const h = createHistogram();
  for (const x of xs) record(h, x);
  assert.equal(h.total, 20000);
  for (const p of [50, 90, 99, 99.9]) {
    const e = exact(xs, p);
    const got = histPercentile(h, p);
    assert.ok(got >= e && got <= e * 1.1 + 0.01, `p${p}: ${got} מול ${e}`);
  }
});
test("זמנים קטנים מ־1ms ← הדלי הראשון; קלט לא תקין ← שגיאה", () => {
  const h = createHistogram();
  record(h, 0.2);
  record(h, 0);
  assert.equal(histPercentile(h, 100), 1);
  assert.throws(() => record(h, -1));
  assert.throws(() => record(h, NaN));
  assert.throws(() => histPercentile(createHistogram(), 50));
});
test("merge של שני שרתים = histogram של כל הדגימות; ממוצע של p99 — לא", () => {
  const fast = Array.from({ length: 9000 }, () => 10 + rand() * 10);
  const slow = Array.from({ length: 1000 }, () => 500 + rand() * 500);
  const a = createHistogram();
  const b = createHistogram();
  const all = createHistogram();
  for (const x of fast) (record(a, x), record(all, x));
  for (const x of slow) (record(b, x), record(all, x));
  const m = merge(a, b);
  assert.deepEqual(m.counts, all.counts);
  assert.equal(m.total, 10000);
  const truth = exact([...fast, ...slow], 99);
  const avgOfP99 = (histPercentile(a, 99) + histPercentile(b, 99)) / 2;
  assert.ok(Math.abs(histPercentile(m, 99) - truth) / truth < 0.1);
  assert.ok(Math.abs(avgOfP99 - truth) / truth > 0.3, "בדיקת שפיות: ממוצע של p99 רחוק מהאמת");
  assert.equal(a.total, 9000, "merge לא משנה את המקור");
});
