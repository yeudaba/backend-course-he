import { test } from "node:test";
import assert from "node:assert/strict";
import mysql from "mysql2/promise";
import { load } from "../../tools/load.mjs";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const { reserveStock } = await load(import.meta.url, "P25.5-E13.ts");

test("20 בקשות במקביל על 3 יחידות ← בדיוק 3 מצליחות", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(20);
  const results = await Promise.all(Array.from({ length: 20 }, () => reserveStock(pool, 5, 1)));
  assert.equal(results.filter(Boolean).length, 3);
  assert.equal((await db.rows("SELECT stock FROM products WHERE id = 5"))[0].stock, 0);
});
test("כמות גדולה מהמלאי, מוצר לא קיים, כמות לא תקינה", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  const pool = db.pool(2);
  assert.equal(await reserveStock(pool, 4, 9), false);
  assert.equal(await reserveStock(pool, 4, 8), true);
  assert.equal(await reserveStock(pool, 999, 1), false);
  await assert.rejects(reserveStock(pool, 4, 0));
  await assert.rejects(reserveStock(pool, 4, -1));
});
