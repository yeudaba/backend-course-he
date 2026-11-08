import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { groupAnagrams } = await load(import.meta.url, "P27-E08.ts");

test("קבוצות לפי סדר הופעה, מילים לפי סדר הקלט", () => {
  assert.deepEqual(groupAnagrams(["listen", "google", "silent", "enlist", "gogole", "cat", "act", "dog"]), [
    ["listen", "silent", "enlist"],
    ["google", "gogole"],
    ["cat", "act"],
    ["dog"],
  ]);
});
test("בלי הבדל בין אותיות גדולות לקטנות; מילים חוזרות נשארות", () => {
  assert.deepEqual(groupAnagrams(["Tea", "eat", "ate", "tea"]), [["Tea", "eat", "ate", "tea"]]);
  assert.deepEqual(groupAnagrams(["ab", "aab", "ba"]), [["ab", "ba"], ["aab"]], "אותן אותיות, כמות שונה — לא אותה קבוצה");
  assert.deepEqual(groupAnagrams([]), []);
});
test("30,000 מילים — מהר", () => {
  const words = Array.from({ length: 30_000 }, (_, i) => `w${i % 1000}x${Math.floor(i / 1000)}`);
  const groups = fastEnough(() => groupAnagrams(words), 500, "groupAnagrams על 30,000 מילים");
  assert.equal(groups.flat().length, 30_000);
});
