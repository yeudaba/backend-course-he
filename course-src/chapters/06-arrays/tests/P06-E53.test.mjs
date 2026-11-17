import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E53.js";
const get = () => exportsOf(import.meta.url, FILE, ["longestWord"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("הארוכה ביותר", async () => {
  const { longestWord } = await get();
  assert.equal(longestWord("I love backend development"), "development");
  assert.equal(longestWord("a bb ccc dd"), "ccc");
  assert.equal(longestWord("שלום"), "שלום");
});
test("תיקו — הראשונה", async () => {
  const { longestWord } = await get();
  assert.equal(longestWord("cat dog"), "cat");
  assert.equal(longestWord("ab cd ef"), "ab");
});
test("רווחים כפולים ומשפט ריק", async () => {
  const { longestWord } = await get();
  assert.equal(longestWord("  hi   there  "), "there");
  assert.equal(longestWord("   "), "");
  assert.equal(longestWord(""), "");
});
