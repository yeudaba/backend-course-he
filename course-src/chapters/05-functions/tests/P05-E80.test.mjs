import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P05-E80.js";
const get = () => exportsOf(import.meta.url, FILE, ["splitBill","billSummary"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("splitBill", async () => {
  const { splitBill } = await get();
  assert.equal(splitBill(487, 6, 12), 91);
  assert.equal(splitBill(100, 4), 28, "ברירת מחדל: טיפ 10%");
  assert.equal(splitBill(300, 7, 15), 50);
  assert.equal(splitBill(90, 3, 0), 30);
});
test("splitBill — קלט לא תקין", async () => {
  const { splitBill } = await get();
  assert.equal(splitBill(100, 0), null);
  assert.equal(splitBill(100, 2.5), null);
  assert.equal(splitBill(0, 4), null);
  assert.equal(splitBill(-50, 4), null);
  assert.equal(splitBill(NaN, 4), null);
});
test("billSummary", async () => {
  const { billSummary } = await get();
  assert.equal(billSummary(100, 4), "4 סועדים × 28 ₪ = 112 ₪ (כולל טיפ 10%)");
  assert.equal(billSummary(487, 6, 12), "6 סועדים × 91 ₪ = 546 ₪ (כולל טיפ 12%)");
  assert.equal(billSummary(100, 2.5), "קלט לא תקין");
});
test("billSummary משתמשת ב־splitBill", () => {
  assert.match(src(), /function\s+billSummary[\s\S]*splitBill\s*\(|billSummary\s*=[\s\S]*splitBill\s*\(/, "billSummary צריכה לקרוא ל־splitBill");
});
