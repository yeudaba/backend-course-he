import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { load } from "../../tools/load.mjs";

const { checkout } = await load(import.meta.url, "P18-E24.ts");
const stock = async (db) => Object.fromEntries((await db.rows("SELECT id, stock FROM catalog")).map((r) => [r.id, r.stock]));

test("הזמנה מלאה", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  const r = await checkout(pool, { customerId: 7, idempotencyKey: "k1", items: [{ productId: 2, quantity: 2 }, { productId: 4, quantity: 1 }, { productId: 2, quantity: 1 }] });
  assert.deepEqual(r, { orderId: 1, total: 294.6, replayed: false });
  assert.deepEqual(await stock(db), { 1: 3, 2: 47, 3: 0, 4: 199 });
  assert.deepEqual(await db.rows("SELECT product_id, quantity, unit_price FROM shop_order_lines ORDER BY product_id"), [
    { product_id: 2, quantity: 3, unit_price: 89.9 },
    { product_id: 4, quantity: 1, unit_price: 24.9 },
  ]);
  await db.query("UPDATE catalog SET price = 999 WHERE id = 2");
  assert.equal((await db.rows("SELECT unit_price FROM shop_order_lines WHERE product_id = 2"))[0].unit_price, 89.9, "המחיר בהזמנה לא משתנה");
});
test("idempotency", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(5);
  const first = await checkout(pool, { customerId: 7, idempotencyKey: "same", items: [{ productId: 1, quantity: 1 }] });
  const again = await checkout(pool, { customerId: 7, idempotencyKey: "same", items: [{ productId: 1, quantity: 1 }] });
  assert.deepEqual(again, { ...first, replayed: true });
  assert.equal((await stock(db))[1], 2, "המלאי ירד פעם אחת");
  const parallel = await Promise.all(Array.from({ length: 5 }, () => checkout(pool, { customerId: 8, idempotencyKey: "p", items: [{ productId: 4, quantity: 10 }] })));
  assert.equal(new Set(parallel.map((p) => p.orderId)).size, 1, "אותה הזמנה לכולם");
  assert.equal(parallel.filter((p) => !p.replayed).length, 1);
  assert.equal((await stock(db))[4], 190);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM shop_orders"))[0].n, 2);
});
test("שגיאות — ושום דבר לא משתנה", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(3);
  const before = await stock(db);
  await assert.rejects(checkout(pool, { customerId: 1, idempotencyKey: "e1", items: [] }), (e) => e.code === "EMPTY_CART");
  await assert.rejects(checkout(pool, { customerId: 1, idempotencyKey: "e2", items: [{ productId: 2, quantity: 1 }, { productId: 99, quantity: 1 }] }), (e) => e.code === "PRODUCT_NOT_FOUND");
  await assert.rejects(checkout(pool, { customerId: 1, idempotencyKey: "e3", items: [{ productId: 2, quantity: 5 }, { productId: 1, quantity: 4 }] }), (e) => e.code === "OUT_OF_STOCK" && e.productId === 1);
  assert.deepEqual(await stock(db), before);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM shop_orders"))[0].n, 0);
  assert.equal(pool.idleCount, pool.totalCount);
});
test("10 קונים, 3 מטחנות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  const pool = db.pool(10);
  const results = await Promise.allSettled(Array.from({ length: 10 }, (_, i) => checkout(pool, { customerId: i, idempotencyKey: `r${i}`, items: [{ productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }] })));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.deepEqual(await stock(db), { 1: 0, 2: 47, 3: 0, 4: 200 });
});
