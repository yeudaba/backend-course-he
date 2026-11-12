import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

test("P18-E60: index לחיפוש לפי total", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E60.sql");
  for (const v of [123.45, 10.5, 499.99]) {
    const p = await plan(db, `SELECT id, customer_id FROM big_orders WHERE total = ${v}`);
    assert.match(p, /Index/, `צריך שימוש ב־index. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Seq Scan/, `בלי Seq Scan. התוכנית:\n${p}`);
  }
  const idx = await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(idx.length, 1, "index אחד");
});
