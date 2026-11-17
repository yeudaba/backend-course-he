import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E51.js";
const get = () => exportsOf(import.meta.url, FILE, ["lowStock"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

const products = () => [
  { id: 1, name: "מקלדת", price: 249, stock: 4 },
  { id: 2, name: "עכבר", price: 89, stock: 0 },
  { id: 3, name: "מסך", price: 899, stock: 2 },
  { id: 4, name: "כבל", price: 19, stock: 2 },
];
test("ברירת מחדל 3, ממוין, רק name ו־stock", async () => {
  const { lowStock } = await get();
  assert.deepEqual(lowStock(products()), [
    { name: "עכבר", stock: 0 },
    { name: "כבל", stock: 2 },
    { name: "מסך", stock: 2 },
  ]);
});
test("סף אחר", async () => {
  const { lowStock } = await get();
  assert.deepEqual(lowStock(products(), 0), [{ name: "עכבר", stock: 0 }]);
  assert.equal(lowStock(products(), 10).length, 4);
  assert.deepEqual(lowStock([], 5), []);
});
test("לא משנה את הקלט", async () => {
  const { lowStock } = await get();
  const list = products();
  lowStock(list);
  assert.deepEqual(list, products(), "המערך והאובייקטים המקוריים חייבים להישאר כמו שהיו");
});
