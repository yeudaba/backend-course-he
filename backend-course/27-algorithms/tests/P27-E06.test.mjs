import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { firstDuplicate, hasDuplicates } = await load(import.meta.url, "P27-E06.ts");

test("firstDuplicate — הראשון שמופיע בפעם השנייה", () => {
  assert.equal(firstDuplicate([3, 1, 4, 1, 5, 3]), 1, "1 חוזר (אינדקס 3) לפני ש־3 חוזר (אינדקס 5)");
  assert.equal(firstDuplicate(["a", "b", "c"]), undefined);
  assert.equal(firstDuplicate([]), undefined);
  assert.equal(firstDuplicate([0, 0]), 0, "0 הוא ערך — לא 'אין'");
  assert.equal(firstDuplicate(["dana@x.com", "yossi@x.com", "dana@x.com"]), "dana@x.com");
});
test("hasDuplicates", () => {
  assert.equal(hasDuplicates([1, 2, 3]), false);
  assert.equal(hasDuplicates([1, 2, 1]), true);
  assert.equal(hasDuplicates([]), false);
});
test("50,000 ערכים — מהר (O(n))", () => {
  const big = Array.from({ length: 50_000 }, (_, i) => i);
  fastEnough(() => assert.equal(firstDuplicate(big), undefined), 300, "firstDuplicate על 50,000 ערכים שונים");
  fastEnough(() => assert.equal(hasDuplicates(big), false), 300, "hasDuplicates על 50,000 ערכים");
});
