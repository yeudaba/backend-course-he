import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E59.js";
const get = () => exportsOf(import.meta.url, FILE, ["countWords"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("ספירה נכונה", async () => {
  const { countWords } = await get();
  assert.equal(countWords("learn node js"), 3);
  assert.equal(countWords("one"), 1);
  assert.equal(countWords("  a   b "), 2);
});
test("טקסט ריק או רק רווחים ← 0", async () => {
  const { countWords } = await get();
  assert.equal(countWords(""), 0);
  assert.equal(countWords("    "), 0);
});
test("בלי console.log בתוך הפונקציה, בלי count - 1", () => {
  assert.doesNotMatch(src(), /count\s*-\s*1/, "תקן את הסיבה, לא את התוצאה");
});
