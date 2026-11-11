import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E66.ts";
async function setup(t) {
  const { categoryRevenue } = await exportsOf(import.meta.url, FILE, ["categoryRevenue"]);
  const db = await sandbox(t, import.meta.url, "store.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  return { report: (opts) => categoryRevenue(client, opts), sent, db };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כל השנה, וחודש אחד", async (t) => {
  const { report } = await setup(t);
  assert.deepEqual(await report({ from: "2026-01-01", to: "2027-01-01" }), [
    { category: "beans", units: 18, revenue: 1058.2 },
    { category: "brewing", units: 5, revenue: 765 },
    { category: "grinders", units: 2, revenue: 378 },
    { category: "accessories", units: 11, revenue: 372.6 },
  ]);
  assert.deepEqual(await report({ from: "2026-03-01", to: "2026-04-01" }), [
    { category: "beans", units: 8, revenue: 349.2 },
    { category: "brewing", units: 1, revenue: 229 },
    { category: "accessories", units: 1, revenue: 39 },
  ], "מרץ בלבד (>= from, < to)");
});
test("minRevenue, תיקו וטווח ריק", async (t) => {
  const { report, db } = await setup(t);
  assert.deepEqual((await report({ from: "2026-01-01", to: "2027-01-01", minRevenue: 378 })).map((r) => r.category), ["beans", "brewing", "grinders"], "HAVING revenue >= 378 (כולל שווה)");
  assert.deepEqual(await report({ from: "2025-01-01", to: "2025-12-31" }), []);
  await db.query("INSERT INTO orders (customer_id, status, created_at) VALUES (4, 'paid', '2026-07-01 00:00:00+03'), (4, 'cancelled', '2026-07-02 10:00:00+03')");
  await db.query("INSERT INTO order_items VALUES (13, 9, 2, 50), (13, 4, 1, 100), (14, 1, 10, 89.9)");
  assert.deepEqual(await report({ from: "2026-07-01", to: "2026-08-01" }), [
    { category: "accessories", units: 2, revenue: 100 },
    { category: "grinders", units: 1, revenue: 100 },
  ], "תיקו — לפי שם הקטגוריה; הזמנה מבוטלת לא נספרת; הזמנה בדיוק ב־from נספרת");
  assert.deepEqual(await report({ from: "2026-06-01", to: "2026-07-01" }), [], "הזמנה ב־to לא נספרת (< to)");
});
test("פרמטרים, וטווח לא תקין בלי מסד", async (t) => {
  const { report, sent } = await setup(t);
  await report({ from: "2026-01-01", to: "2026-02-01", minRevenue: 5 });
  assert.equal(sent.length, 1);
  assert.ok(!sent[0].text.includes("2026-01-01"), "התאריכים כפרמטרים, לא בתוך הטקסט");
  assert.deepEqual([...sent[0].values].sort(), ["2026-01-01", "2026-02-01", 5].sort());
  sent.length = 0;
  await assert.rejects(report({ from: "2026-05-01", to: "2026-05-01" }), { message: "טווח תאריכים לא תקין" });
  await assert.rejects(report({ from: "2026-06-01", to: "2026-05-01" }), { message: "טווח תאריכים לא תקין" });
  assert.equal(sent.length, 0, "בלי לפנות למסד");
});
