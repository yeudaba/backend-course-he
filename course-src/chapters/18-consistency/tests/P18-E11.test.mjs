import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

test("index לשאילתת הלקוח", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E11.sql");
  const p = await plan(db, "SELECT id, total, created_at FROM big_orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10");
  assert.match(p, /Index Scan/, `צריך Index Scan. התוכנית:\n${p}`);
  assert.doesNotMatch(p, /Sort/, `בלי מיון. התוכנית:\n${p}`);
  const idx = await db.rows("SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(idx[0].n, 1, "index אחד");
});
