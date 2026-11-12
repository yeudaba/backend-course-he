import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E69.ts", ["anonymizeCustomer"])).anonymizeCustomer;

test("אנונימיזציה", async (t) => {
  const anonymize = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(3);
  assert.deepEqual(await anonymize(pool, 1), { cartItemsRemoved: 2 });
  assert.deepEqual(await db.rows("SELECT name, email, city FROM customers WHERE id = 1"), [{ name: "Deleted user", email: "deleted+1@invalid.local", city: "" }]);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM cart_items WHERE customer_id = 1"))[0].n, 0);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM orders WHERE customer_id = 1"))[0].n, 2, "ההזמנות נשארו");
  assert.deepEqual(await anonymize(pool, 4), { cartItemsRemoved: 0 }, "לקוח בלי עגלה");
  assert.equal((await db.rows("SELECT email FROM customers WHERE id = 4"))[0].email, "deleted+4@invalid.local", "שני מחוקים — שני אימיילים שונים");
});
test("לא קיים, וכישלון באמצע ← כלום לא משתנה", async (t) => {
  const anonymize = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(3);
  await assert.rejects(anonymize(pool, 99), { message: "NOT_FOUND" });
  await db.query("INSERT INTO customers (name, email, city) VALUES ('x', 'deleted+1@invalid.local', 'x')");
  await assert.rejects(anonymize(pool, 1), /Duplicate/);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM cart_items WHERE customer_id = 1"))[0].n, 2, "העגלה לא נמחקה");
  assert.equal((await db.rows("SELECT name FROM customers WHERE id = 1"))[0].name, "Dana Levi");
  assert.equal(pool.pool._allConnections.length - pool.pool._freeConnections.length, 0, "כל החיבורים חזרו ל־pool");
});
