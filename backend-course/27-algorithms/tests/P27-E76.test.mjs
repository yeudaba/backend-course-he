import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fastEnough } from "./_perf.mjs";

const { isPalindromeSentence } = await load(import.meta.url, "P27-E76.ts");

test("אנגלית, עברית, ספרות", () => {
  assert.equal(isPalindromeSentence("A man, a plan, a canal: Panama"), true);
  assert.equal(isPalindromeSentence("race a car"), false);
  assert.equal(isPalindromeSentence("אבא"), true);
  assert.equal(isPalindromeSentence("ילד, דלי!"), true);
  assert.equal(isPalindromeSentence("12-21"), true);
  assert.equal(isPalindromeSentence("1a2"), false);
  assert.equal(isPalindromeSentence(""), true);
  assert.equal(isPalindromeSentence("..,"), true);
});
test("1,000,000 תווים — מהר", () => {
  const half = "Ab, c".repeat(100_000);
  const s = half + [...half].reverse().join("");
  assert.equal(fastEnough(() => isPalindromeSentence(s), 200, "isPalindromeSentence"), true);
});
