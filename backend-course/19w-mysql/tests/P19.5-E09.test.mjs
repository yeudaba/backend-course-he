import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { insertOrder } = await load(import.meta.url, "P19.5-E09.ts");

test("הזמנה: total, פריטים במחיר של עכשיו, והמלאי יורד", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(5);
  const r = await insertOrder(pool, { customerId: 5, items: [{ productId: 4, quantity: 2 }, { productId: 9, quantity: 3 }] });
  assert.equal(r.totalCents, 2 * 18900 + 3 * 2490);
  const [order] = await db.rows("SELECT customer_id, status, total FROM orders WHERE id = ?", [r.orderId]);
  assert.deepEqual(order, { customer_id: 5, status: "pending_payment", total: 452.7 });
  assert.deepEqual(await db.rows("SELECT product_id, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY product_id", [r.orderId]), [
    { product_id: 4, quantity: 2, unit_price: 189 },
    { product_id: 9, quantity: 3, unit_price: 24.9 },
  ]);
  assert.deepEqual((await db.rows("SELECT stock FROM products WHERE id IN (4, 9) ORDER BY id")).map((x) => x.stock), [6, 297]);
});
test("חסר מלאי ← שגיאה, ושום דבר לא נשמר (rollback)", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(5);
  const before = (await db.rows("SELECT COUNT(*) n FROM orders"))[0].n;
  await assert.rejects(insertOrder(pool, { customerId: 1, items: [{ productId: 9, quantity: 1 }, { productId: 5, quantity: 4 }] }), /מלאי/);
  assert.equal((await db.rows("SELECT COUNT(*) n FROM orders"))[0].n, before);
  assert.equal((await db.rows("SELECT stock FROM products WHERE id = 9"))[0].stock, 300);
});
test("החיבורים חוזרים ל־pool (גם אחרי שגיאה)", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(2);
  for (let i = 0; i < 5; i++) await insertOrder(pool, { customerId: 1, items: [{ productId: 7, quantity: 1 }] }).catch(() => {});
  const r = await insertOrder(pool, { customerId: 1, items: [{ productId: 3, quantity: 1 }] });
  assert.ok(r.orderId > 0, "עם pool של 2, חיבור שלא שוחרר היה תוקע את הקריאה הזו");
});
