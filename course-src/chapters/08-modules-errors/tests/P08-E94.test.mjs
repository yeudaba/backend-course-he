import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const FILE = "P08-E94.js";
const get = () => exportsOf(import.meta.url, FILE, ["highlight"]);

test("כל ההופעות, בלי הבדל בין גדולות לקטנות", async () => {
  const { highlight } = await get();
  assert.equal(highlight("Node ו־node ו־NODE", "node"), "**Node** ו־**node** ו־**NODE**", "כל הופעה, בכתיב המקורי שלה");
  assert.equal(highlight("קפה הפוך וקפה שחור", "קפה"), "**קפה** הפוך ו**קפה** שחור");
  assert.equal(highlight("אין כאן כלום", "x"), "אין כאן כלום");
});
test("מילה עם תווים מיוחדים היא טקסט, לא תבנית", async () => {
  const { highlight } = await get();
  assert.equal(highlight("C++ או c++?", "c++"), "**C++** או **c++**?", "c++ — צריך escaping");
  assert.equal(highlight("105 או 1.5", "1.5"), "105 או **1.5**", "הנקודה ב־1.5 היא נקודה, לא 'כל תו'");
  assert.equal(highlight("f(x) = (1", "(1"), "f(x) = **(1**", "\"(1\" לא אמור לזרוק SyntaxError");
  assert.equal(highlight("עלות: $5 ו־$5", "$5"), "עלות: **$5** ו־**$5**");
  assert.equal(highlight("a|b ו־ab", "a|b"), "**a|b** ו־ab");
  assert.equal(highlight("נתיב C:\\temp", "\\temp"), "נתיב C:**\\temp**");
});
test("מילה ריקה ← בלי שינוי", async () => {
  const { highlight } = await get();
  assert.equal(highlight("שלום", ""), "שלום");
});
