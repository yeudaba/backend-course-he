import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E67.ts";
const get = () => exportsOf(import.meta.url, FILE, ["ReportQuery", "buildReport"]);
const KEYS = { city: "COALESCE(c.city, 'unknown')", status: "o.status", month: "date_trunc('month', o.created_at)::date::text" };
const expectedSql = (by) => `SELECT ${KEYS[by]} AS key, COUNT(*) AS orders FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY 1 HAVING COUNT(*) >= $1 ORDER BY orders DESC, key`;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("ReportQuery: enum, coerce וברירת מחדל", async () => {
  const { ReportQuery } = await get();
  assert.deepEqual(ReportQuery.parse({ by: "city" }), { by: "city", minOrders: 1 });
  assert.deepEqual(ReportQuery.parse({ by: "month", minOrders: "3" }), { by: "month", minOrders: 3 }, "minOrders מגיע מה־URL כמחרוזת");
  for (const bad of [{}, { by: "name" }, { by: "city; DROP TABLE orders" }, { by: "city", minOrders: "0" }, { by: "city", minOrders: "1.5" }, { by: "city", minOrders: "abc" }]) {
    assert.equal(ReportQuery.safeParse(bad).success, false, `צריך להיכשל: ${JSON.stringify(bad)}`);
  }
});
test("buildReport — אותה תוצאה כמו השאילתה הנכונה, לכל קיבוץ", async (t) => {
  const { buildReport } = await get();
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.query("INSERT INTO orders (customer_id, status, created_at) VALUES (4, 'paid', '2026-05-20 10:00+03')");
  for (const [by, min] of [["city", "1"], ["city", "3"], ["status", "2"], ["month", "1"], ["month", "3"]]) {
    const q = buildReport({ by, minOrders: min });
    const got = await db.rows(q.text, q.values);
    const expected = await db.rows(expectedSql(by), [Number(min)]);
    assert.deepEqual(got, expected, `by=${by}, minOrders=${min}`);
  }
  const q = buildReport({ by: "status" });
  assert.deepEqual(q.values, [1], "minOrders כפרמטר יחיד");
  assert.match(q.text, /\$1/);
});
test("קלט לא תקין — נזרק, לא נבנית שאילתה", async () => {
  const { buildReport } = await get();
  assert.throws(() => buildReport({ by: "city; DROP TABLE orders" }));
  assert.throws(() => buildReport({ by: "status", minOrders: "-1" }));
  assert.throws(() => buildReport(null));
});
