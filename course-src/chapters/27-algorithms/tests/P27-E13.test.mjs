import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough, seeded } from "./_perf.mjs";

const { mergeIntervals } = await load(import.meta.url, "P27-E13.ts");

test("מאחד חפיפות; התוצאה ממוינת", () => {
  assert.deepEqual(mergeIntervals([[9, 12], [1, 3], [2, 6], [8, 10], [15, 18]]), [[1, 6], [8, 12], [15, 18]]);
  assert.deepEqual(mergeIntervals([[1, 3], [3, 5]]), [[1, 5]], "נוגעים (סוף = התחלה) — מתאחדים");
  assert.deepEqual(mergeIntervals([[1, 10], [2, 3], [4, 5]]), [[1, 10]], "מוכל לגמרי");
  assert.deepEqual(mergeIntervals([]), []);
});
test("לא משנה את הקלט", () => {
  const input = [[5, 6], [1, 2]];
  const copy = JSON.parse(JSON.stringify(input));
  mergeIntervals(input);
  assert.deepEqual(input, copy, "הקלט נשאר כמו שהיה — sort ממיין במקום, צריך עותק");
});
test("100,000 מרווחים — מהר (O(n log n))", () => {
  const rnd = seeded(7);
  const input = Array.from({ length: 100_000 }, () => {
    const s = Math.floor(rnd() * 10_000_000);
    return [s, s + Math.floor(rnd() * 50)];
  });
  const out = fastEnough(() => mergeIntervals(input), 800, "mergeIntervals על 100,000 מרווחים");
  for (let i = 1; i < out.length; i++) assert.ok(out[i][0] > out[i - 1][1], "אין חפיפות בתוצאה");
});
