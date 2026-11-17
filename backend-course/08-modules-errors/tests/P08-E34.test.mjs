import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E34.js";
const get = () => exportsOf(import.meta.url, FILE, ["describe"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const math = () => exportsOf(import.meta.url, "P08-E34-math.js", ["sum", "average"]);
test("sum ו־average יוצאו מהמודול", async () => {
  const { sum, average } = await math();
  assert.equal(sum([1, 2, 3]), 6);
  assert.equal(sum([]), 0);
  assert.equal(average([1, 2, 3, 6]), 3);
  assert.equal(average([5]), 5);
  assert.equal(average([]), 0, "מערך ריק ← 0");
});
test("describe", async () => {
  const { describe } = await get();
  assert.equal(describe([1, 2, 3, 6]), "4 מספרים, סכום 12, ממוצע 3");
  assert.equal(describe([10, 20]), "2 מספרים, סכום 30, ממוצע 15");
  assert.equal(describe([]), "0 מספרים, סכום 0, ממוצע 0");
});
test("describe מייבאת מהמודול", () => {
  assert.match(src(), /require\(\s*["']\.\/P08-E34-math(\.js)?["']\s*\)/, 'חסר require("./P08-E34-math")');
  assert.doesNotMatch(src(), /function\s+(sum|average)\b/, "אל תגדיר את sum או average שוב — ייבא אותן");
});
