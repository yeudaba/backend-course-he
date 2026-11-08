import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

const QUERY = "SELECT id, total FROM orders WHERE customer_id = 3 AND status = 'paid' ORDER BY created_at DESC LIMIT 10";

test("האינדקס: בלי filesort, ובלי לסרוק הזמנות בסטטוס אחר", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  // 30,000 הזמנות ללקוח 3 — רובן מבוטלות; 20 ששולמו
  await db.query("SET SESSION cte_max_recursion_depth = 100000");
  await db.query(`INSERT INTO orders (customer_id, status, total, created_at)
    WITH RECURSIVE n(i) AS (SELECT 1 UNION ALL SELECT i + 1 FROM n WHERE i < 30000)
    SELECT 3, IF(i % 1500 = 0, 'paid', 'cancelled'), 10, '2026-01-01' + INTERVAL i MINUTE FROM n`);
  await db.runFile("P19.5-E18.sql");
  await db.query("ANALYZE TABLE orders");
  const [{ EXPLAIN: plan }] = await db.rows(`EXPLAIN FORMAT=JSON ${QUERY}`);
  const json = JSON.parse(plan);
  const table = json.query_block.ordering_operation?.table ?? json.query_block.table;
  assert.notEqual(table.access_type, "ALL", "לא סריקה מלאה");
  assert.ok(!json.query_block.ordering_operation?.using_filesort, "בלי filesort — האינדקס כבר ממוין לפי created_at");
  assert.ok(Number(table.rows_examined_per_scan) <= 50, `נבדקות ${table.rows_examined_per_scan} שורות — האינדקס צריך לכלול גם את status`);
  assert.equal((await db.rows(QUERY)).length, 10);
});
