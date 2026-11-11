import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E56.js";
const get = () => exportsOf(import.meta.url, FILE, ["productErrors","validateAll"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("productErrors — תקין", async () => {
  const { productErrors } = await get();
  assert.deepEqual(productErrors({ name: "עט", price: 5, stock: 10 }), []);
  assert.deepEqual(productErrors({ name: "x", price: 0.5, stock: 0 }), [], "מלאי 0 תקין");
});
test("productErrors — כל בעיה לבד", async () => {
  const { productErrors } = await get();
  assert.deepEqual(productErrors({ name: "  ", price: 5, stock: 1 }), ["חסר שם"]);
  assert.deepEqual(productErrors({ price: 5, stock: 1 }), ["חסר שם"], "מוצר בלי שדה name בכלל");
  assert.deepEqual(productErrors({ name: "a", price: "5", stock: 1 }), ["מחיר לא תקין"], "מחרוזת היא לא מספר");
  assert.deepEqual(productErrors({ name: "a", price: NaN, stock: 1 }), ["מחיר לא תקין"]);
  assert.deepEqual(productErrors({ name: "a", price: 0, stock: 1 }), ["מחיר לא תקין"]);
  assert.deepEqual(productErrors({ name: "a", price: 5, stock: -1 }), ["מלאי לא תקין"]);
  assert.deepEqual(productErrors({ name: "a", price: 5, stock: 2.5 }), ["מלאי לא תקין"]);
  assert.deepEqual(productErrors({ name: "a", price: 5, stock: "3" }), ["מלאי לא תקין"]);
});
test("productErrors — כמה בעיות, בסדר הנכון", async () => {
  const { productErrors } = await get();
  assert.deepEqual(productErrors({ name: "", price: -1, stock: -1 }), ["חסר שם", "מחיר לא תקין", "מלאי לא תקין"]);
});
test("validateAll", async () => {
  const { validateAll } = await get();
  assert.deepEqual(validateAll([
    { name: "עט", price: 5, stock: 10 },
    { name: "  ", price: "5", stock: 1 },
    { name: "תיק", price: 120, stock: -2 },
  ]), ["שורה 2: חסר שם", "שורה 2: מחיר לא תקין", "שורה 3: מלאי לא תקין"]);
  assert.deepEqual(validateAll([]), []);
  assert.deepEqual(validateAll([{ name: "a", price: 1, stock: 1 }]), []);
});
