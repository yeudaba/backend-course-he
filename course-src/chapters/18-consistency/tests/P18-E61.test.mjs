import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

async function pagesRead(db, query) {
  const lines = (await db.rows(`EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF) ${query}`)).map((r) => r["QUERY PLAN"]);
  const b = lines.find((l) => /Buffers:/.test(l)) ?? "";
  return Number(b.match(/hit=(\d+)/)?.[1] ?? 0) + Number(b.match(/read=(\d+)/)?.[1] ?? 0);
}

test("P18-E61: index בלי Sort", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E61.sql");
  for (const c of [42, 7, 1999]) {
    const p = await plan(db, `SELECT id, total, created_at FROM big_orders WHERE customer_id = ${c} AND status = 'paid' ORDER BY created_at DESC LIMIT 5`);
    assert.match(p, /Index Scan/, `צריך Index Scan. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Sort/, `בלי שלב מיון. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Seq Scan/, `בלי Seq Scan. התוכנית:\n${p}`);
    assert.doesNotMatch(p, /Filter:/, `status צריך להיות חלק מה־index (Index Cond), לא סינון אחרי הקריאה. התוכנית:\n${p}`);
  }
  const idx = await db.rows("SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(idx[0].n, 1, "index אחד");
  await db.query("INSERT INTO big_orders (customer_id, status, total, created_at) VALUES (7777, 'paid', 10, '2025-01-01 10:00+00'), (7777, 'paid', 11, '2025-01-02 10:00+00')");
  const pages = await pagesRead(db, "SELECT id, total, created_at FROM big_orders WHERE customer_id = 7777 AND status = 'paid' ORDER BY created_at DESC LIMIT 5");
  assert.ok(pages < 60, `השאילתה קראה ${pages} דפים — סדר העמודות: קודם השוויון (customer_id, ‏status), ואחריו created_at`);
});
