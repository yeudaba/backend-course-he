import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { priceOf, withProduct } = await load(import.meta.url, "P07-E07.js");

// מחירון חדש לכל בדיקה — כך שינוי של המקור בבדיקה אחת לא "זולג" להודעה של בדיקה אחרת
const makeCatalog = () => ({ "KB-101": 199, "MS-201": 89 });

test("priceOf", () => {
  const catalog = makeCatalog();
  assert.equal(priceOf(catalog, "KB-101"), 199);
  assert.equal(priceOf(catalog, " ms-201 "), 89, `priceOf(catalog, " ms-201 ") — הקוד מנורמל: trim ואותיות גדולות`);
  assert.equal(priceOf(catalog, "X"), null, `priceOf(catalog, "X") — קוד שלא קיים מחזיר null`);
});
test("withProduct מוסיף מוצר חדש", () => {
  assert.deepEqual(withProduct(makeCatalog(), " kb-102 ", 249), { "KB-101": 199, "MS-201": 89, "KB-102": 249 });
});
test("withProduct מעדכן מחיר של מוצר קיים", () => {
  assert.deepEqual(withProduct(makeCatalog(), "KB-101", 150), { "KB-101": 150, "MS-201": 89 });
});
test("withProduct לא משנה את המקור", () => {
  const catalog = makeCatalog();
  const result = withProduct(catalog, "Z", 1);
  assert.deepEqual(catalog, makeCatalog(), "המחירון המקורי השתנה אחרי withProduct(catalog, \"Z\", 1) — צריך להחזיר עותק חדש");
  assert.notEqual(result, catalog, "withProduct החזירה את אותו אובייקט שקיבלה — צריך אובייקט חדש");
});
