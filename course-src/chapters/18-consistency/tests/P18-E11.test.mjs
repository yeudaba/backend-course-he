import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { plan } from "./_helpers.mjs";

// כמה דפים (buffers) קראה השאילתה בפועל — index בסדר עמודות הפוך עדיין "Index Scan", אבל קורא כמעט את כל ה־index
async function pagesRead(db, query) {
  const lines = (await db.rows(`EXPLAIN (ANALYZE, BUFFERS, COSTS OFF, TIMING OFF) ${query}`)).map((r) => r["QUERY PLAN"]);
  const m = lines.find((l) => /Buffers:/.test(l))?.match(/hit=(\d+)/);
  const r = lines.find((l) => /Buffers:/.test(l))?.match(/read=(\d+)/);
  return Number(m?.[1] ?? 0) + Number(r?.[1] ?? 0);
}

test("index לשאילתת הלקוח", async (t) => {
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.runFile("P18-E11.sql");
  const p = await plan(db, "SELECT id, total, created_at FROM big_orders WHERE customer_id = 42 ORDER BY created_at DESC LIMIT 10");
  assert.match(p, /Index Scan/, `צריך Index Scan. התוכנית:\n${p}`);
  assert.doesNotMatch(p, /Sort/, `בלי מיון. התוכנית:\n${p}`);
  // לקוח עם הזמנות ישנות בלבד: index של (customer_id, created_at) קורא כמה דפים; (created_at, customer_id) — כמעט את כל ה־index
  await db.query("INSERT INTO big_orders (customer_id, status, total, created_at) VALUES (7777, 'paid', 10, '2025-01-01 10:00+00'), (7777, 'paid', 11, '2025-01-02 10:00+00')");
  const pages = await pagesRead(db, "SELECT id, total, created_at FROM big_orders WHERE customer_id = 7777 ORDER BY created_at DESC LIMIT 10");
  assert.ok(pages < 60, `השאילתה קראה ${pages} דפים — ה־index צריך להתחיל ב־customer_id (השוויון), ורק אחריו created_at (המיון)`);
  const idx = await db.rows("SELECT COUNT(*) AS n FROM pg_indexes WHERE schemaname = current_schema() AND tablename = 'big_orders' AND indexname <> 'big_orders_pkey'");
  assert.equal(idx[0].n, 1, "index אחד");
});
