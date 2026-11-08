import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { consumerLag, isFallingBehind } = await load(import.meta.url, "P26.5-E19.ts");

test("lag לכל partition, סך הכול, והגרוע ביותר", () => {
  assert.deepEqual(consumerLag({ 0: 1200, 1: 980, 2: 1500 }, { 0: 1190, 1: 980, 2: 700 }), {
    perPartition: { 0: 10, 1: 0, 2: 800 },
    total: 810,
    worstPartition: 2,
  });
});
test("partition בלי commit ← הכול מ־earliest (או מ־0)", () => {
  assert.deepEqual(consumerLag({ 0: 50, 1: 70 }, { 0: 50 }).perPartition, { 0: 0, 1: 70 });
  assert.deepEqual(consumerLag({ 0: 50, 1: 70 }, { 0: 50, 1: -1 }, { 1: 60 }).perPartition, { 0: 0, 1: 10 }, "retention מחק את 0–59");
});
test("ריק", () => {
  assert.deepEqual(consumerLag({}, {}), { perPartition: {}, total: 0, worstPartition: null });
});
test("isFallingBehind: עלייה רציפה — לא קפיצה אחת", () => {
  assert.equal(isFallingBehind([0, 5, 0, 900, 0]), false, "קפיצה וחזרה");
  assert.equal(isFallingBehind([100, 120, 180, 260]), true);
  assert.equal(isFallingBehind([100, 120, 120, 260]), false, "לא עלה בכל דגימה");
  assert.equal(isFallingBehind([10, 20, 30]), false, "מעט מדי דגימות");
  assert.equal(isFallingBehind([1, 2, 3, 4, 5, 6], { window: 5 }), true);
});
