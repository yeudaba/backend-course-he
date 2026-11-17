import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E100.ts", ["fullScans"])).fullScans;

test("סריקות מלאות — ובלי", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  await db.query("ANALYZE TABLE orders, products, customers, order_items");
  const a = await f(pool, "SELECT id FROM orders WHERE status = ?", ["paid"]);
  assert.deepEqual(a.map((x) => x.table), ["orders"]);
  assert.equal(typeof a[0].rows, "number");
  assert.ok(a[0].rows >= 1);
  assert.deepEqual(await f(pool, "SELECT id FROM orders WHERE customer_id = ?", [3]), []);
  assert.deepEqual(await f(pool, "SELECT * FROM products WHERE id = 3"), []);
  const join = await f(pool, "SELECT c.name, o.total FROM customers c JOIN orders o ON o.customer_id = c.id WHERE c.city = ?", ["Haifa"]);
  assert.deepEqual(join.map((x) => x.table), ["c"], "בתוך nested_loop, בעומק");
  const two = await f(pool, "SELECT * FROM customers WHERE city = 'Haifa' UNION ALL SELECT * FROM customers WHERE name LIKE '%a%'");
  assert.deepEqual(two.map((x) => x.table), ["customers"], "בלי כפילויות");
});
