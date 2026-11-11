import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const get = () => exportsOf(import.meta.url, "P10-E27.js", ["orderTotal"]);
const CATALOG = { A: 10, B: 25, C: 4.5, D: 100, E: 1 };
const slowPrice = (ms = 50) => (sku) => new Promise((resolve, reject) => setTimeout(() => (sku in CATALOG ? resolve(CATALOG[sku]) : reject(new Error(`אין מחיר ל־${sku}`))), ms));

test("הדוגמה מהמשימה — 80", async () => {
  const { orderTotal } = await get();
  assert.equal(await orderTotal([{ sku: "A", qty: 3 }, { sku: "B", qty: 2 }], async (sku) => CATALOG[sku]), 80);
});
test("הזמנה ריקה — 0", async () => {
  const { orderTotal } = await get();
  assert.equal(await orderTotal([], slowPrice()), 0);
});
test("הסדר נשמר גם כשהתשובות מגיעות בסדר אחר", async () => {
  const { orderTotal } = await get();
  const delays = { A: 60, B: 5 };
  const getPrice = (sku) => new Promise((r) => setTimeout(() => r(CATALOG[sku]), delays[sku]));
  assert.equal(await orderTotal([{ sku: "A", qty: 1 }, { sku: "B", qty: 4 }], getPrice), 110);
});
test("במקביל: 5 פריטים × 50ms ← פחות מ־150ms", async () => {
  const { orderTotal } = await get();
  const items = ["A", "B", "C", "D", "E"].map((sku) => ({ sku, qty: 2 }));
  const start = Date.now();
  const total = await orderTotal(items, slowPrice(50));
  const ms = Date.now() - start;
  assert.equal(total, 281);
  assert.ok(ms < 150, `לקח ${ms}ms — נראה שהמחירים נשלפים אחד אחרי השני. Promise.all`);
});
test("מחיר שנכשל — orderTotal נכשלת עם אותה שגיאה", async () => {
  const { orderTotal } = await get();
  await assert.rejects(orderTotal([{ sku: "A", qty: 1 }, { sku: "ZZZ", qty: 1 }], slowPrice(5)), { message: "אין מחיר ל־ZZZ" });
});
