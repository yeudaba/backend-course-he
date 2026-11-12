import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { expireOrder } = await load(import.meta.url, "P26-E97.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query(`
    CREATE TABLE products (id int PRIMARY KEY, stock int NOT NULL);
    CREATE TABLE orders (id int PRIMARY KEY, status text NOT NULL);
    CREATE TABLE order_items (order_id int REFERENCES orders, product_id int REFERENCES products, quantity int NOT NULL);
    INSERT INTO products VALUES (1, 35), (2, 10), (3, 0);
    INSERT INTO orders VALUES (1, 'paid'), (2, 'pending_payment'), (3, 'pending_payment');
    INSERT INTO order_items VALUES (1, 1, 2), (2, 1, 3), (2, 3, 4), (3, 2, 1);`);
  return db;
}
const stock = async (db) => Object.fromEntries((await db.rows("SELECT id, stock FROM products ORDER BY id")).map((r) => [r.id, r.stock]));

test("ממתינה ← expired והמלאי חוזר; שולמה או לא קיימת ← skipped", async (t) => {
  const db = await setup(t);
  const pool = db.pool();
  assert.equal(await expireOrder(pool, 2), "expired");
  assert.deepEqual(await stock(db), { 1: 38, 2: 10, 3: 4 });
  assert.equal((await db.rows("SELECT status FROM orders WHERE id = 2"))[0].status, "cancelled");
  assert.equal(await expireOrder(pool, 2), "skipped", "כבר בוטלה");
  assert.equal(await expireOrder(pool, 1), "skipped", "שולמה");
  assert.equal(await expireOrder(pool, 99), "skipped");
  assert.deepEqual(await stock(db), { 1: 38, 2: 10, 3: 4 });
  assert.equal((await db.rows("SELECT status FROM orders WHERE id = 1"))[0].status, "paid");
});
test("5 במקביל — expired אחד, המלאי חוזר פעם אחת", async (t) => {
  const db = await setup(t);
  const pool = db.pool(6);
  const r = await Promise.all(Array.from({ length: 5 }, () => expireOrder(pool, 3)));
  assert.equal(r.filter((x) => x === "expired").length, 1, JSON.stringify(r));
  assert.equal((await stock(db))[2], 11);
});
