import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { copyCustomers } = await load(import.meta.url, "P19.5-E25.ts");

async function setup(t, n) {
  const pg = await sandbox(t, import.meta.url);
  await pg.query(`CREATE TABLE customers (id integer PRIMARY KEY, name text NOT NULL, email text NOT NULL, is_vip boolean NOT NULL, balance numeric(10,2) NOT NULL, created_at timestamptz NOT NULL);
    INSERT INTO customers SELECT g, 'לקוח ' || g || CASE WHEN g % 7 = 0 THEN ' ☕' ELSE '' END, 'c' || g || '@x.com', g % 5 = 0, (g * 1.1)::numeric(10,2),
      timestamptz '2026-03-01 00:30:00+02' + (g || ' minutes')::interval FROM generate_series(1, ${n}) g`);
  const my = await mysqlSandbox(t, import.meta.url);
  await my.query("CREATE TABLE customers (id INT UNSIGNED PRIMARY KEY, name VARCHAR(100) NOT NULL, email VARCHAR(255) NOT NULL, is_vip BOOLEAN NOT NULL, balance DECIMAL(10,2) NOT NULL, created_at DATETIME(3) NOT NULL) DEFAULT CHARSET=utf8mb4");
  return { pg, my, pool: my.pool(3) };
}

test("2,500 לקוחות: בקבוצות, עם המרת טיפוסים", async (t) => {
  const { pg, pool, my } = await setup(t, 2500);
  const r = await copyCustomers(pg.client, pool, { batchSize: 1000 });
  assert.deepEqual(r, { copied: 2500, batches: 3 });
  const [row] = await my.rows("SELECT name, is_vip, balance, created_at FROM customers WHERE id = 35");
  assert.deepEqual(row, { name: "לקוח 35 ☕", is_vip: 1, balance: 38.5, created_at: "2026-02-28 23:05:00.000" });
  const [{ s }] = await my.rows("SELECT CAST(SUM(balance) AS CHAR) s FROM customers");
  const [{ ps }] = await pg.rows("SELECT SUM(balance)::text ps FROM customers");
  assert.equal(s, ps, "סכום היתרות זהה עד האגורה");
});
test("הרצה שנייה — לא מכפילה, ומעדכנת שינויים", async (t) => {
  const { pg, pool, my } = await setup(t, 120);
  await copyCustomers(pg.client, pool, { batchSize: 50 });
  await pg.query("UPDATE customers SET name = 'Dana' WHERE id = 7");
  const r = await copyCustomers(pg.client, pool, { batchSize: 50 });
  assert.deepEqual(r, { copied: 120, batches: 3 });
  assert.equal((await my.rows("SELECT COUNT(*) n FROM customers"))[0].n, 120);
  assert.equal((await my.rows("SELECT name FROM customers WHERE id = 7"))[0].name, "Dana");
});
