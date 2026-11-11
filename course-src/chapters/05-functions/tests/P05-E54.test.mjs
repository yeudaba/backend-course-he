import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E54.js";
const get = () => exportsOf(import.meta.url, FILE, ["countVowels","hasVowel"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("countVowels", async () => {
  const { countVowels } = await get();
  assert.equal(countVowels("Backend Developers"), 6);
  assert.equal(countVowels("AEIOU aeiou"), 10);
  assert.equal(countVowels("rhythm"), 0);
  assert.equal(countVowels(""), 0);
});
test("hasVowel", async () => {
  const { hasVowel } = await get();
  assert.equal(hasVowel("rhythm"), false);
  assert.equal(hasVowel("sky a"), true);
});
test("hasVowel משתמשת ב־countVowels", () => {
  assert.match(src(), /function\s+hasVowel[\s\S]*countVowels\s*\(/, "hasVowel צריכה לקרוא ל־countVowels");
});
