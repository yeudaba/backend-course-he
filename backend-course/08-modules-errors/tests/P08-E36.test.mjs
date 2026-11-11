import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P08-E36.js";
const get = () => exportsOf(import.meta.url, FILE, ["nextOrderNumber","peek","resetOrders"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("מספרים רצים עם קידומת ו־5 ספרות", async () => {
  const { nextOrderNumber, resetOrders } = await get();
  resetOrders();
  assert.equal(nextOrderNumber(), "ORD-00001");
  assert.equal(nextOrderNumber(), "ORD-00002");
  for (let i = 0; i < 9; i++) nextOrderNumber();
  assert.equal(nextOrderNumber(), "ORD-00012");
});
test("peek ו־resetOrders", async () => {
  const { nextOrderNumber, peek, resetOrders } = await get();
  resetOrders();
  assert.equal(peek(), 0);
  nextOrderNumber();
  nextOrderNumber();
  assert.equal(peek(), 2);
  resetOrders();
  assert.equal(nextOrderNumber(), "ORD-00001");
});
test("המונה פרטי", async () => {
  const mod = await get();
  assert.equal(mod.count, undefined, "אל תייצא את המונה — רק את הפונקציות");
});
