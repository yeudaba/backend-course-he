import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { topK } = await load(import.meta.url, "P27-E14.ts");

test("k הנפוצים, מהגבוה לנמוך", () => {
  const sold = ["latte", "mocha", "latte", "espresso", "latte", "mocha", "tea"];
  assert.deepEqual(topK(sold, 2), [{ item: "latte", count: 3 }, { item: "mocha", count: 2 }]);
});
test("בתיקו — לפי סדר אלפביתי; k גדול מהכמות — כולם", () => {
  assert.deepEqual(topK(["b", "a", "c", "a", "b", "c"], 2), [{ item: "a", count: 2 }, { item: "b", count: 2 }]);
  assert.deepEqual(topK(["x"], 5), [{ item: "x", count: 1 }]);
  assert.deepEqual(topK([], 3), []);
});
test("200,000 פריטים — מהר", () => {
  const items = Array.from({ length: 200_000 }, (_, i) => `p${i % 5000}`);
  items.push("p42");
  const top = fastEnough(() => topK(items, 3), 500, "topK על 200,000 פריטים (5,000 שונים)");
  assert.deepEqual(top[0], { item: "p42", count: 41 });
});
