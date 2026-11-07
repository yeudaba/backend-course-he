import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

test("index חלקי", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E15.sql");
  const defs = await db.rows("SELECT indexdef FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(defs.length, 1, "index אחד");
  assert.match(defs[0].indexdef, / WHERE /, "index חלקי — עם WHERE");
  const p = await plan(db, "SELECT id, total FROM big_orders WHERE status IN ('paid', 'pending') ORDER BY created_at LIMIT 50");
  assert.match(p, /Index Scan/, p);
  assert.doesNotMatch(p, /Sort/, p);
});
