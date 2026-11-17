import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E37.js";
const get = () => exportsOf(import.meta.url, FILE, ["capitalize","truncate","formatPrice","clamp"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("כל ארבע הפונקציות דרך ה־index", async () => {
  const { capitalize, truncate, formatPrice, clamp } = await get();
  assert.equal(capitalize("dana"), "Dana");
  assert.equal(truncate("hello world", 5), "hell…");
  assert.equal(truncate("hi", 5), "hi");
  assert.equal(truncate("12345", 5), "12345", "בדיוק באורך max — בלי חיתוך");
  assert.equal(formatPrice(12.5), "₪12.50");
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-3, 0, 10), 0);
  assert.equal(clamp(4, 0, 10), 4);
});
test("כל קובץ מייצא רק את שלו", async () => {
  const strings = await exportsOf(import.meta.url, "P08-E37-strings.js", ["capitalize", "truncate"]);
  const numbers = await exportsOf(import.meta.url, "P08-E37-numbers.js", ["formatPrice", "clamp"]);
  assert.equal(strings.formatPrice, undefined);
  assert.equal(numbers.capitalize, undefined);
});
test("ה־index רק מייבא", () => {
  assert.match(src(), /require\(\s*["']\.\/P08-E37-strings(\.js)?["']\s*\)/, 'חסר require("./P08-E37-strings")');
  assert.match(src(), /require\(\s*["']\.\/P08-E37-numbers(\.js)?["']\s*\)/, 'חסר require("./P08-E37-numbers")');
  assert.doesNotMatch(src(), /function\s+\w+|=>/, "בקובץ ה־index לא מגדירים פונקציות — רק מייבאים ומייצאים");
});
