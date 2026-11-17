import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

async function start(t) {
  const { ordersRouter } = await exportsOf(import.meta.url, "P25.5-E68.ts", ["ordersRouter"]);
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(10);
  const app = express();
  app.use(express.json());
  app.use(ordersRouter(pool));
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), db, pool };
}

test("הזמנה רגילה", async (t) => {
  const { call, db } = await start(t);
  const r = await call("POST", "/orders", { customerId: 3, productId: 6, quantity: 2 });
  assert.equal(r.status, 201);
  assert.equal(r.body.totalCents, 23800);
  const [o] = await db.rows("SELECT customer_id, status, total FROM orders WHERE id = ?", [r.body.orderId]);
  assert.deepEqual(o, { customer_id: 3, status: "pending_payment", total: 238 });
  assert.deepEqual(await db.rows("SELECT quantity, unit_price FROM order_items WHERE order_id = ?", [r.body.orderId]), [{ quantity: 2, unit_price: 119 }]);
  assert.deepEqual(await db.rows("SELECT stock FROM products WHERE id = 6"), [{ stock: 23 }]);
});
test("שגיאות", async (t) => {
  const { call, db } = await start(t);
  for (const body of [{}, { customerId: 1, productId: 1, quantity: 0 }, { customerId: "1", productId: 1, quantity: 1 }, { customerId: 1, productId: 1.5, quantity: 1 }]) {
    const r = await call("POST", "/orders", body);
    assert.deepEqual([r.status, r.body?.error?.code], [400, "VALIDATION_ERROR"], JSON.stringify(body));
  }
  assert.deepEqual([(await call("POST", "/orders", { customerId: 1, productId: 999, quantity: 1 })).status], [404]);
  assert.equal((await call("POST", "/orders", { customerId: 1, productId: 10, quantity: 1 })).body.error.code, "PRODUCT_NOT_FOUND", "מוצר לא פעיל");
  const oos = await call("POST", "/orders", { customerId: 1, productId: 2, quantity: 1 });
  assert.deepEqual([oos.status, oos.body.error.code], [409, "OUT_OF_STOCK"]);
  const noCustomer = await call("POST", "/orders", { customerId: 999, productId: 6, quantity: 1 });
  assert.deepEqual([noCustomer.status, noCustomer.body.error.code], [404, "CUSTOMER_NOT_FOUND"]);
  assert.deepEqual(await db.rows("SELECT stock FROM products WHERE id = 6"), [{ stock: 25 }], "המלאי לא ירד בגלל לקוח שלא קיים");
  assert.deepEqual((await db.rows("SELECT COUNT(*) AS n FROM orders"))[0].n, 6, "לא נוצרו הזמנות");
});
test("10 במקביל על 3 יחידות", async (t) => {
  const { call, db, pool } = await start(t);
  const results = await Promise.all(Array.from({ length: 10 }, () => call("POST", "/orders", { customerId: 2, productId: 5, quantity: 1 })));
  assert.equal(results.filter((r) => r.status === 201).length, 3);
  assert.equal(results.filter((r) => r.status === 409).length, 7);
  assert.deepEqual(await db.rows("SELECT stock FROM products WHERE id = 5"), [{ stock: 0 }]);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM orders"))[0].n, 9);
  assert.equal(pool.pool._allConnections.length - pool.pool._freeConnections.length, 0, "כל החיבורים חזרו ל־pool");
});
