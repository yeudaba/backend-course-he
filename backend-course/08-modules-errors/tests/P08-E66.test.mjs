import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E66.js";
const get = () => exportsOf(import.meta.url, FILE, ["addVatAll"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מע״מ פעם אחת, גם בקריאה השנייה", async () => {
  const { addVatAll } = await get();
  const catalog = [{ name: "עט", price: 10 }, { name: "תיק", price: 100 }];
  assert.deepEqual(addVatAll(catalog), [{ name: "עט", price: 11.8 }, { name: "תיק", price: 118 }]);
  assert.deepEqual(addVatAll(catalog), [{ name: "עט", price: 11.8 }, { name: "תיק", price: 118 }], "הקריאה השנייה החזירה תוצאה אחרת — הקלט השתנה");
});
test("הקלט לא משתנה, והאובייקטים חדשים", async () => {
  const { addVatAll } = await get();
  const catalog = [{ name: "עט", price: 10, sku: "P1" }];
  const r = addVatAll(catalog);
  assert.deepEqual(catalog, [{ name: "עט", price: 10, sku: "P1" }]);
  assert.notEqual(r[0], catalog[0], "צריך אובייקט חדש לכל מוצר");
  assert.equal(r[0].sku, "P1", "שאר השדות נשמרים");
});
