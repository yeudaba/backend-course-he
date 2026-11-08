import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { countingArray } from "./_perf.mjs";

const { lowerBound, countInRange } = await load(import.meta.url, "P27-E20.ts");
const prices = [10, 20, 20, 20, 35, 50];

test("lowerBound — האינדקס הראשון שהערך בו >= x", () => {
  assert.equal(lowerBound(prices, 20), 1, "הראשון מבין השווים");
  assert.equal(lowerBound(prices, 21), 4);
  assert.equal(lowerBound(prices, 5), 0);
  assert.equal(lowerBound(prices, 50), 5);
  assert.equal(lowerBound(prices, 51), 6, "כולם קטנים ← length");
  assert.equal(lowerBound([], 7), 0);
});
test("countInRange — כמה ערכים בין from ל־to, כולל שניהם", () => {
  assert.equal(countInRange(prices, 20, 35), 4);
  assert.equal(countInRange(prices, 0, 100), 6);
  assert.equal(countInRange(prices, 21, 34), 0);
  assert.equal(countInRange(prices, 50, 50), 1);
  assert.equal(countInRange(prices, 40, 30), 0, "from > to ← 0");
});
test("לוגריתמי: מערך של מיליון — מעט קריאות", () => {
  const { array, stats } = countingArray(Array.from({ length: 1_000_000 }, (_, i) => i * 3));
  assert.equal(lowerBound(array, 2_000_000), 666_667);
  assert.ok(stats.reads <= 25, `lowerBound קרא ${stats.reads} תאים — חיפוש בינארי צריך כ־20 (log₂ של מיליון)`);
  stats.reads = 0;
  assert.equal(countInRange(array, 300, 3000), 901);
  assert.ok(stats.reads <= 50, `countInRange קרא ${stats.reads} תאים — שני חיפושים בינאריים, כ־40`);
});
