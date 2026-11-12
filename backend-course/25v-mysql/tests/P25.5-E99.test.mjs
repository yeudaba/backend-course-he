import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.5-E99.ts", ["normalizeSql", "slowLogReport"]);
const entry = (time, examined, sql, db = "") => `# Time: 2026-11-07T15:30:24.134567Z
# User@Host: app[app] @  [172.18.0.4]  Id:    12
# Query_time: ${time}  Lock_time: 0.000012 Rows_sent: 10  Rows_examined: ${examined}
${db}SET timestamp=1762529424;
${sql}
`;

test("normalizeSql", async () => {
  const { normalizeSql } = await get();
  assert.equal(normalizeSql("SELECT * FROM t WHERE name = 'O''Brien'  AND id IN (1, 2.5)\n  LIMIT 10;"), "SELECT * FROM t WHERE name = ? AND id IN (?, ?) LIMIT ?");
  assert.equal(normalizeSql("SELECT col1, t2.x FROM t2 WHERE a = 'Room 101'"), "SELECT col1, t2.x FROM t2 WHERE a = ?", "col1 — לא מספר");
  assert.equal(normalizeSql("  UPDATE p SET s = s - 3 WHERE id = 7 ;  "), "UPDATE p SET s = s - ? WHERE id = ?");
});
test("slowLogReport", async () => {
  const { slowLogReport } = await get();
  const log = "/usr/sbin/mysqld, Version: 8.4.0. started with:\nTcp port: 3306\n" +
    entry("1.200000", 30000, "SELECT id, total FROM orders WHERE customer_id = 3 AND status = 'paid'\n  ORDER BY created_at DESC LIMIT 10;", "use shop;\n") +
    entry("0.400100", 500, "SELECT * FROM products WHERE name LIKE '%grinder%';") +
    entry("0.900000", 45000, "SELECT id, total FROM orders WHERE customer_id = 17 AND status = 'shipped' ORDER BY created_at DESC LIMIT 20;") +
    entry("0.500000", 800, "SELECT * FROM products WHERE name LIKE '%press%';");
  assert.deepEqual(slowLogReport(log), [
    { query: "SELECT id, total FROM orders WHERE customer_id = ? AND status = ? ORDER BY created_at DESC LIMIT ?", count: 2, totalSeconds: 2.1, maxRowsExamined: 45000 },
    { query: "SELECT * FROM products WHERE name LIKE ?", count: 2, totalSeconds: 0.9, maxRowsExamined: 800 },
  ]);
  assert.deepEqual(slowLogReport(""), []);
});
