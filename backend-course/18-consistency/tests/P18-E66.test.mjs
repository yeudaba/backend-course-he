import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P18-E66.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["planSummary"])).planSummary;
async function walk(db, sql, params) {
  const { rows } = await db.client.query(`EXPLAIN (FORMAT JSON) ${sql}`, params);
  const s = { nodes: [], seqScans: [], indexes: [] };
  const go = (n) => {
    s.nodes.push(n["Node Type"]);
    if (n["Node Type"] === "Seq Scan") s.seqScans.push(n["Relation Name"]);
    if (n["Index Name"] && !s.indexes.includes(n["Index Name"])) s.indexes.push(n["Index Name"]);
    for (const c of n.Plans ?? []) go(c);
  };
  go(rows[0]["QUERY PLAN"][0].Plan);
  return s;
}

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("סיכום תוכניות — פשוטות, עם פרמטרים, ועם JOIN", async (t) => {
  const planSummary = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("CREATE INDEX big_orders_customer_id_idx ON big_orders (customer_id)");
  const pool = db.pool(2);
  assert.deepEqual(await planSummary(pool, "SELECT * FROM accounts WHERE owner = 'Dana'"), { nodes: ["Seq Scan"], seqScans: ["accounts"], indexes: [] });
  const byCustomer = await planSummary(pool, "SELECT id FROM big_orders WHERE customer_id = $1", [42]);
  assert.deepEqual(byCustomer.seqScans, []);
  assert.deepEqual(byCustomer.indexes, ["big_orders_customer_id_idx"], "עם פרמטר $1");
  const cases = [
    ["SELECT o.id FROM people p JOIN big_orders o ON o.customer_id = p.id WHERE p.id = $1 ORDER BY o.created_at", [42]],
    ["SELECT p.full_name, COUNT(*) FROM people p JOIN big_orders o ON o.customer_id = p.id WHERE p.id BETWEEN $1 AND $2 GROUP BY p.full_name", [10, 12]],
    ["SELECT id FROM big_orders WHERE customer_id IN (1, 2) OR id = 5", []],
    ["SELECT a.owner, t.amount FROM accounts a JOIN transfers t ON t.from_id = a.id", []],
  ];
  for (const [sql, params] of cases) assert.deepEqual(await planSummary(pool, sql, params), await walk(db, sql, params), sql);
});
