import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E54.js";
const get = () => exportsOf(import.meta.url, FILE, ["wordCount", "isLongerThan"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("wordCount", async () => {
  const { wordCount } = await get();
  assert.equal(wordCount("  קפה   הפינה פתוח "), 3, "רווחים כפולים ובקצוות");
  assert.equal(wordCount("one"), 1);
  assert.equal(wordCount("a b  c d"), 4);
  assert.equal(wordCount(""), 0);
  assert.equal(wordCount("     "), 0, "רק רווחים ← 0");
});
test("isLongerThan, עם ברירת מחדל 10", async () => {
  const { isLongerThan } = await get();
  assert.equal(isLongerThan("a b c", 2), true);
  assert.equal(isLongerThan("a b", 2), false, "בדיוק limit — לא יותר");
  assert.equal(isLongerThan("a b c"), false, "בלי limit — ברירת המחדל 10");
  assert.equal(isLongerThan("1 2 3 4 5 6 7 8 9 10 11"), true);
  assert.equal(isLongerThan("1 2 3 4 5 6 7 8 9 10"), false);
});
test("isLongerThan משתמשת ב־wordCount, בלי if; ובלי split", () => {
  const s = src();
  assert.match(s, /function\s+isLongerThan[\s\S]*wordCount\s*\(/, "isLongerThan צריכה לקרוא ל־wordCount");
  const body = /function\s+isLongerThan[^{]*\{([\s\S]*?)\n\}/.exec(s)?.[1] ?? "";
  assert.ok(!/\bif\b/.test(body), "isLongerThan — בלי if: ההשוואה כבר בוליאני");
  assert.ok(!/\.split\s*\(/.test(s), "בלי split — לולאה על התווים");
});
