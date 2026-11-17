import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E69.ts", ["toRows"])).toRows;

test("שורות", async () => {
  const f = await get();
  const doc = { _id: "o1", customerId: "c1", status: "delivered", createdAt: new Date("2026-10-02T09:12:00Z"), total: 1, items: [{ productId: "p1", name: "E", price: 62, qty: 2 }, { productId: "p5", name: "V", price: 89, qty: 1 }, { productId: "p1", name: "E", price: 60, qty: 1 }] };
  assert.deepEqual(f(doc), {
    order: { id: "o1", customer_id: "c1", status: "delivered", created_at: "2026-10-02T09:12:00.000Z", total: 273 },
    items: [
      { order_id: "o1", line: 1, product_id: "p1", quantity: 2, unit_price: 62 },
      { order_id: "o1", line: 2, product_id: "p5", quantity: 1, unit_price: 89 },
      { order_id: "o1", line: 3, product_id: "p1", quantity: 1, unit_price: 60 },
    ],
  });
  assert.deepEqual(f({ ...doc, items: [] }).order.total, 0);
});
