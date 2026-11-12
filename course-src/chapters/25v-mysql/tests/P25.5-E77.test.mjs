import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";
import { plainPool } from "./_pool.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.5-E77.ts", ["markShipped"])).markShipped;

test("ארבעת המצבים", async (t) => {
  const f = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = plainPool(t, db);
  assert.equal(await f(pool, 1), "shipped");
  assert.equal(await f(pool, 1), "already", "שליחה חוזרת");
  assert.equal(await f(pool, 4), "already", "כבר נשלחה בנתונים");
  assert.equal(await f(pool, 3), "invalid_status", "מבוטלת");
  assert.equal(await f(pool, 6), "invalid_status", "לא שולמה");
  assert.equal(await f(pool, 99), "not_found");
  assert.deepEqual((await db.rows("SELECT id, status FROM orders ORDER BY id")).map((r) => r.status), ["shipped", "paid", "cancelled", "shipped", "paid", "pending_payment"]);
});
