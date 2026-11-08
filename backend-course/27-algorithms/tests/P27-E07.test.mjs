import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { twoSum } = await load(import.meta.url, "P27-E07.ts");

test("זוג שסכומו target — אינדקסים [i, j], i < j", () => {
  assert.deepEqual(twoSum([89, 119, 30, 70, 24], 100), [2, 3]);
  assert.deepEqual(twoSum([50, 20, 50], 100), [0, 2], "אותו ערך פעמיים — שני אינדקסים שונים");
  assert.equal(twoSum([50, 20], 100), null, "לא משתמשים באותו מוצר פעמיים");
  assert.equal(twoSum([], 10), null);
});
test("הזוג הראשון — לפי j הקטן, ואז i הקטן", () => {
  assert.deepEqual(twoSum([1, 9, 9, 1, 5, 5], 10), [0, 1]);
  assert.deepEqual(twoSum([5, 1, 9, 1], 10), [1, 2]);
});
test("50,000 מחירים — מהר (O(n))", () => {
  const prices = Array.from({ length: 50_000 }, (_, i) => i * 2); // כולם זוגיים — סכום אי־זוגי לא קיים
  fastEnough(() => assert.equal(twoSum(prices, 99_999), null), 300, "twoSum על 50,000 מחירים בלי פתרון");
  fastEnough(() => assert.deepEqual(twoSum(prices, 2 * 49_998 + 2 * 49_999), [49_998, 49_999]), 300, "twoSum שהפתרון שלו בסוף");
});
