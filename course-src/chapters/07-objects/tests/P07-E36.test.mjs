import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P07-E36.js";
const get = () => exportsOf(import.meta.url, FILE, ["updateStock"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("עדכון רגיל", async () => {
  const { updateStock } = await get();
  const p = { name: "עכבר", stock: 2, inStock: true };
  assert.equal(updateStock(p, -2), true);
  assert.deepEqual(p, { name: "עכבר", stock: 0, inStock: false });
  assert.equal(updateStock(p, 5), true);
  assert.deepEqual(p, { name: "עכבר", stock: 5, inStock: true });
});
test("מלאי שלילי ← false, בלי שינוי", async () => {
  const { updateStock } = await get();
  const p = { name: "מסך", stock: 1, inStock: true };
  assert.equal(updateStock(p, -3), false);
  assert.deepEqual(p, { name: "מסך", stock: 1, inStock: true }, "אסור לשנות את האובייקט כשהעדכון נדחה");
});
test("inStock מתעדכן גם מ־0 למעלה", async () => {
  const { updateStock } = await get();
  const p = { name: "x", stock: 0, inStock: false };
  updateStock(p, 1);
  assert.equal(p.inStock, true);
  updateStock(p, 0);
  assert.equal(p.stock, 1);
});
