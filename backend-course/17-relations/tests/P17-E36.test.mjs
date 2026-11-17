import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P17-E36: הלקוחה, ההזמנה והפריטים", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  const last = await db.fileRows("P17-E36.sql");
  const tal = await db.rows("SELECT id, full_name, email, city, joined_on FROM customers WHERE email = 'tal@example.com'");
  assert.equal(tal.length, 1, "צריכה להיות לקוחה אחת עם tal@example.com");
  assert.deepEqual(tal[0], { id: 9, full_name: "Tal Gil", email: "tal@example.com", city: "Eilat", joined_on: "2026-05-10" });
  const orders = await db.rows("SELECT id, status, created_at FROM orders WHERE customer_id = 9");
  assert.equal(orders.length, 1, "הזמנה אחת של Tal");
  assert.equal(orders[0].status, "pending");
  assert.equal(orders[0].created_at.toISOString(), "2026-05-10T07:00:00.000Z", "created_at = 2026-05-10 10:00:00+03");
  const items = await db.rows("SELECT order_id, product_id, quantity, unit_price FROM order_items WHERE order_id = $1 ORDER BY product_id", [orders[0].id]);
  assert.deepEqual(items, [
    { order_id: orders[0].id, product_id: 3, quantity: 2, unit_price: 29.9 },
    { order_id: orders[0].id, product_id: 10, quantity: 1, unit_price: 39 },
  ], "שני פריטים, במחיר של היום מ־products");
  assert.deepEqual(last, items, "ה־SELECT בסוף: order_id, product_id, quantity, unit_price של ההזמנה החדשה, לפי product_id");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM orders"))[0].n, 13, "רק הזמנה אחת חדשה");
});
