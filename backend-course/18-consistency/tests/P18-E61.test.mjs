import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

test("P18-E61: index בלי Sort", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E61.sql");
  for (const c of [42, 7, 1999]) {
    const p = await plan(db, `SELECT id, total, created_at FROM big_orders WHERE customer_id = ${c} AND status = 'paid' ORDER BY created_at DESC LIMIT 5`);
    assert.match(p, /Index Scan/, `צריך Index Scan. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Sort/, `בלי שלב מיון. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Seq Scan/, `בלי Seq Scan. התוכנית:\n${p}`);
  }
  const idx = await db.rows("SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(idx[0].n, 1, "index אחד");
});
