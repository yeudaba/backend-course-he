import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { getUnitPrice, validateQuantity, couponDiscount, checkout } = await load(import.meta.url, "P05-E24.js");

test("getUnitPrice", () => {
  assert.equal(getUnitPrice("KB-101"), 199);
  assert.equal(getUnitPrice(" kb-102 "), 249);
  assert.equal(getUnitPrice("ms-201"), 89);
  assert.equal(getUnitPrice("XX-1"), null);
});
test("validateQuantity", () => {
  assert.equal(validateQuantity("3"), null);
  assert.equal(validateQuantity(""), "כמות חייבת להיות מספר");
  assert.equal(validateQuantity("abc"), "כמות חייבת להיות מספר");
  assert.equal(validateQuantity("2.5"), "כמות חייבת להיות מספר שלם בין 1 ל־5");
  assert.equal(validateQuantity("0"), "כמות חייבת להיות מספר שלם בין 1 ל־5");
  assert.equal(validateQuantity("8", 10), null);
});
test("couponDiscount", () => {
  assert.equal(couponDiscount("", 300), 0);
  assert.equal(couponDiscount("vip20", 1000), 200);
  assert.equal(couponDiscount("VIP20", 500), null);
  assert.equal(couponDiscount("WELCOME", 100), 30);
  assert.equal(couponDiscount("WELCOME", 20), 20);
  assert.equal(couponDiscount("FREE", 100), null);
});
test("checkout — הצלחה", () => {
  assert.equal(checkout(" kb-102 ", "3", "VIP20", true), "לתשלום: 597.60");
  assert.equal(checkout("MS-201", "1", "", true), "לתשלום: 89.00");
});
test("checkout — שגיאות בסדר הנכון", () => {
  assert.equal(checkout("XX", "abc", "BAD", false), "שגיאה: יש להתחבר כדי להזמין");
  assert.equal(checkout("XX", "abc", "BAD", true), "שגיאה: מוצר לא קיים");
  assert.equal(checkout("KB-101", "abc", "BAD", true), "שגיאה: כמות חייבת להיות מספר");
  assert.equal(checkout("KB-101", "9", "", true), "שגיאה: כמות חייבת להיות מספר שלם בין 1 ל־5");
  assert.equal(checkout("KB-101", "2", "VIP20", true), "שגיאה: הקופון לא קיים או לא תקף להזמנה הזו");
});
