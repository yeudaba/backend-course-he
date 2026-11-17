import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E55.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["nestOrders"])).nestOrders;
const row = (order_id, full_name, status, product = null, quantity = null, unit_price = null) => ({ order_id, full_name, status, product, quantity, unit_price });

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("קיבוץ לפי הזמנה, סדר, ודיוק", async () => {
  const nestOrders = await get();
  const out = nestOrders([
    row(5, "Michal", "shipped", "Beans", 1, 89.9),
    row(2, "Yossi", "shipped", "Hand Grinder", 1, 189),
    row(5, "Michal", "shipped", "Moka", 1, 149),
    row(2, "Yossi", "shipped", "Brazil", 3, 19.9),
    row(5, "Michal", "shipped", "Filters", 2, 24.9),
  ]);
  assert.deepEqual(out, [
    { id: 5, customer: "Michal", status: "shipped", total: 288.7, items: [
      { product: "Beans", quantity: 1, unitPrice: 89.9, lineTotal: 89.9 },
      { product: "Moka", quantity: 1, unitPrice: 149, lineTotal: 149 },
      { product: "Filters", quantity: 2, unitPrice: 24.9, lineTotal: 49.8 },
    ] },
    { id: 2, customer: "Yossi", status: "shipped", total: 248.7, items: [
      { product: "Hand Grinder", quantity: 1, unitPrice: 189, lineTotal: 189 },
      { product: "Brazil", quantity: 3, unitPrice: 19.9, lineTotal: 59.7 },
    ] },
  ], "lineTotal של 3 × 19.9 הוא 59.7 (לא 59.699999999999996)");
});
test("הזמנה בלי פריטים, וקלט ריק", async () => {
  const nestOrders = await get();
  assert.deepEqual(nestOrders([row(4, "Noa", "cancelled")]), [{ id: 4, customer: "Noa", status: "cancelled", items: [], total: 0 }]);
  assert.deepEqual(nestOrders([]), []);
  const out = nestOrders([row(1, "A", "paid", "x", 1, 0.1), row(1, "A", "paid", "y", 1, 0.2), row(9, "B", "paid")]);
  assert.equal(out[0].total, 0.3, "0.1 + 0.2 = 0.3 (באגורות)");
  assert.deepEqual(out[1].items, []);
});
