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
  await db.query("INSERT INTO big_orders (customer_id, status, total, created_at) VALUES (7777, 'paid', 10, '2025-01-01 10:00+00'), (7777, 'paid', 11, '2025-01-02 10:00+00')");
  const pages = await pagesRead(db, "SELECT id, total FROM big_orders WHERE customer_id = 7777 ORDER BY created_at DESC LIMIT 10");
  assert.ok(pages < 60, `שאילתת הלקוח קראה ${pages} דפים — ה־index צריך להתחיל ב־customer_id (השוויון), ורק אחריו created_at`);
});
