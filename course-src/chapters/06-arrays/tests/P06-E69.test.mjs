import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E69.js";
const get = () => exportsOf(import.meta.url, FILE, ["isValidCoupon","validCoupons"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("isValidCoupon", async () => {
  const { isValidCoupon } = await get();
  assert.equal(isValidCoupon("IL123456"), true);
  assert.equal(isValidCoupon(" il123456 "), true, "trim ואותיות גדולות לפני הבדיקה");
  assert.equal(isValidCoupon("IL12345"), false, "קצר מדי");
  assert.equal(isValidCoupon("IL1234567"), false, "ארוך מדי");
  assert.equal(isValidCoupon("IL12a456"), false, "אות בין הספרות");
  assert.equal(isValidCoupon("XX123456"), false);
  assert.equal(isValidCoupon("IL1e3456"), false);
  assert.equal(isValidCoupon("IL 12345"), false);
});
test("validCoupons — מנוקים ותקינים", async () => {
  const { validCoupons } = await get();
  assert.deepEqual(validCoupons([" il123456", "IL12345", "IL12a456", "XX123456", "IL000001 "]), ["IL123456", "IL000001"]);
  assert.deepEqual(validCoupons([]), []);
});
test("every על התווים", () => {
  assert.match(src(), /\.every\s*\(/, "בדוק את הספרות עם split(\"\") ו־every");
});
