import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { createOrderFromCart, EmptyCart, OutOfStock } = await load(import.meta.url, "P19.5-E24.ts");
const REQUESTS = "CREATE TABLE order_requests (idem_key VARCHAR(100) PRIMARY KEY, customer_id INT UNSIGNED NOT NULL, order_id INT UNSIGNED NULL)";

async function setup(t) {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query(REQUESTS);
  return { db, pool: db.pool(12) };
}

test("עגלה ← הזמנה: מחירים של עכשיו, מלאי יורד, עגלה מתרוקנת", async (t) => {
  const { db, pool } = await setup(t);
  await db.query("UPDATE products SET price = 31.90 WHERE id = 3");
  const r = await createOrderFromCart(pool, 1, "k-1");
  assert.deepEqual([r.totalCents, r.replayed], [2 * 3190 + 2490, false]);
  assert.deepEqual(await db.rows("SELECT product_id, quantity, unit_price FROM order_items WHERE order_id = ? ORDER BY product_id", [r.orderId]), [
    { product_id: 3, quantity: 2, unit_price: 31.9 },
    { product_id: 9, quantity: 1, unit_price: 24.9 },
  ]);
  assert.deepEqual((await db.rows("SELECT stock FROM products WHERE id IN (3, 9) ORDER BY id")).map((x) => x.stock), [118, 299]);
  assert.equal((await db.rows("SELECT COUNT(*) n FROM cart_items WHERE customer_id = 1"))[0].n, 0);
});
test("אותו מפתח — אותה הזמנה (גם במקביל)", async (t) => {
  const { db, pool } = await setup(t);
  const [a, b] = await Promise.all([createOrderFromCart(pool, 1, "k-2"), createOrderFromCart(pool, 1, "k-2")]);
  assert.equal(a.orderId, b.orderId);
  assert.deepEqual([a.replayed, b.replayed].sort(), [false, true]);
  const c = await createOrderFromCart(pool, 1, "k-2");
  assert.deepEqual([c.orderId, c.replayed, c.totalCents], [a.orderId, true, a.totalCents]);
  assert.equal((await db.rows("SELECT COUNT(*) n FROM orders WHERE customer_id = 1"))[0].n, 3, "2 מה־seed + 1");
});
test("10 לקוחות על 3 יחידות — בדיוק 3 הזמנות", async (t) => {
  const { db, pool } = await setup(t);
  await db.query("DELETE FROM cart_items");
  for (let i = 0; i < 10; i++) await db.query("INSERT INTO customers (name, email, city) VALUES (?, ?, 'X')", [`c${i}`, `c${i}@x.com`]);
  const ids = (await db.rows("SELECT id FROM customers WHERE email LIKE 'c%@x.com' ORDER BY id")).map((r) => r.id);
  for (const id of ids) await db.query("INSERT INTO cart_items VALUES (?, 5, 1)", [id]);
  const results = await Promise.allSettled(ids.map((id) => createOrderFromCart(pool, id, `k-${id}`)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  for (const r of results) if (r.status === "rejected") assert.ok(r.reason instanceof OutOfStock, String(r.reason));
  assert.equal((await db.rows("SELECT stock FROM products WHERE id = 5"))[0].stock, 0);
});
test("עגלה ריקה, וכישלון — בלי שאריות; אפשר לנסות שוב עם אותו מפתח", async (t) => {
  const { db, pool } = await setup(t);
  await assert.rejects(createOrderFromCart(pool, 2, "k-3"), (e) => e instanceof EmptyCart);
  await db.query("INSERT INTO cart_items VALUES (2, 7, 1)");
  await assert.rejects(createOrderFromCart(pool, 2, "k-3"), (e) => e instanceof OutOfStock && e.productId === 7);
  assert.equal((await db.rows("SELECT COUNT(*) n FROM order_requests"))[0].n, 0);
  await db.query("UPDATE products SET stock = 1 WHERE id = 7");
  assert.equal((await createOrderFromCart(pool, 2, "k-3")).replayed, false);
});
