import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("P17-E27: התוצאה (עמודות, שורות וסדר)", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  const got = await db.fileRows("P17-E27.sql");
  const expected = await db.expectedRows("P17-E27.sql");
  assert.deepEqual(Object.keys(got?.[0] ?? {}), Object.keys(expected[0]), "שמות העמודות והסדר שלהן (full_name, order_id, order_no, total, running_total)");
  assert.equal(got.length, expected.length, "מספר ההזמנות (רק כאלה שלא בוטלו)");
  assert.deepEqual(got.map((r) => r.order_no), expected.map((r) => r.order_no), "order_no — מתחיל מ־1 לכל לקוח (PARTITION BY)");
  assert.deepEqual(got.map((r) => r.running_total), expected.map((r) => r.running_total), "running_total — סכום מצטבר לכל לקוח (SUM ... OVER (PARTITION BY ... ORDER BY ...))");
  assert.deepEqual(got, expected);
});
test("P17-E27: לקוח עם שתי הזמנות באותו שם", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  // לקוחה שנייה בשם Dana Levi — order_no ו־running_total צריכים להתחיל מחדש גם לה
  await db.query("INSERT INTO customers (full_name, email, city, joined_on) VALUES ('Dana Levi', 'dana2@example.com', 'Eilat', '2026-06-01')");
  await db.query("INSERT INTO orders (customer_id, status, created_at) SELECT id, 'paid', '2026-06-02' FROM customers WHERE email = 'dana2@example.com'");
  await db.query("INSERT INTO order_items (order_id, product_id, quantity, unit_price) SELECT MAX(id), 1, 1, 10 FROM orders");
  const rows = (await db.fileRows("P17-E27.sql")).filter((r) => r.full_name === "Dana Levi");
  const second = rows.find((r) => Number(r.total) === 10);
  assert.ok(second, "ההזמנה של הלקוחה השנייה חסרה");
  assert.equal(Number(second.order_no), 1, "לקוחה אחרת עם אותו שם — order_no מתחיל מ־1. חלק לפי c.id ולא לפי השם");
  assert.equal(Number(second.running_total), 10);
});
