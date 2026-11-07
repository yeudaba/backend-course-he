import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

test("שני indexes לשלוש שאילתות", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E25.sql");
  const count = (await db.rows("SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'"))[0].n;
  assert.ok(count >= 1 && count <= 2, `${count} indexes — מותר עד 2`);
  for (const q of [
    "SELECT id, total FROM big_orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10",
    "SELECT id FROM big_orders WHERE status = 'pending' AND created_at >= '2025-12-24' ORDER BY created_at",
    "SELECT COUNT(*) FROM big_orders WHERE status = 'cancelled' AND created_at >= '2025-12-01'",
  ]) {
    const p = await plan(db, q);
    assert.doesNotMatch(p, /Seq Scan/, `${q}\n${p}`);
    assert.match(p, /Index/, `${q}\n${p}`);
  }
});
