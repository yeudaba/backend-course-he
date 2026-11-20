import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { exportsOf } from "./_ts.mjs";


const within = (p, ms, msg) => { let timer; return Promise.race([p, new Promise((_, rej) => { timer = setTimeout(() => rej(new Error(msg)), ms); })]).finally(() => clearTimeout(timer)); };
const get = async () => (await exportsOf(import.meta.url, "P25.5-E63.ts", ["salesReport"])).salesReport;

test("בלי הפרעה", async (t) => {
  const salesReport = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  assert.deepEqual(await salesReport(db.pool(2)), { orders: 4, revenue: 1284.9, ids: [1, 2, 4, 5] });
});
test("הזמנה חדשה באמצע — הדוח עדיין עקבי", async (t) => {
  const salesReport = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const other = await mysql.createConnection(db.url);
  t.after(() => other.end());
  const r = await salesReport(db.pool(2), async () => {
    await other.query("INSERT INTO orders (customer_id, status, total) VALUES (5, 'paid', 100.00)");
    await other.query("UPDATE orders SET status = 'shipped' WHERE id = 6");
  });
  assert.equal(r.ids.length, r.orders, "הרשימה תואמת לספירה");
  assert.deepEqual(r, { orders: 4, revenue: 1284.9, ids: [1, 2, 4, 5] }, "התמונה מההתחלה");
  assert.equal(typeof r.revenue, "number");
  const after = await salesReport(db.pool(2));
  assert.equal(after.orders, 6, "הדוח הבא כבר רואה");
});
test("החיבור חוזר ל־pool", async (t) => {
  const salesReport = await get();
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(1);
  await salesReport(pool);
  await within(salesReport(pool), 3000, "pool של חיבור אחד: הדוח השני נתקע — חסר conn.release() ב־finally");
});
