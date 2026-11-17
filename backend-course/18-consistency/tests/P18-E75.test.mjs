import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";
import { countingPool } from "./_helpers.mjs";

const FILE = "P18-E75.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["ordersWithLines"])).ordersWithLines;
const DATA = `INSERT INTO shop_orders (customer_id, idempotency_key, total) VALUES (1, 'a', 278.80), (2, 'b', 24.90), (1, 'c', 0.01);
INSERT INTO shop_order_lines VALUES (1, 2, 1, 89.90), (1, 1, 1, 189.00), (2, 4, 1, 24.90);`;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("שתי שאילתות, סדר, כפילויות וחסרים", async (t) => {
  const ordersWithLines = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query(DATA);
  const { pool, counter } = countingPool(db.pool(3));
  const out = await ordersWithLines(pool, [2, 99, 1, 3, 2]);
  assert.deepEqual(out, [
    { id: 2, total: 24.9, lines: [{ product: "Paper Filters (100)", quantity: 1, unitPrice: 24.9 }] },
    { id: 1, total: 278.8, lines: [{ product: "Ethiopia Beans 1kg", quantity: 1, unitPrice: 89.9 }, { product: "Hand Grinder", quantity: 1, unitPrice: 189 }] },
    { id: 3, total: 0.01, lines: [] },
  ], "סדר כמו בקלט, 99 לא קיים, 2 פעם אחת, שורות לפי שם המוצר");
  assert.equal(counter.n, 2, "בדיוק שתי שאילתות");
});
test("200 הזמנות — עדיין שתי שאילתות; ריק — אפס", async (t) => {
  const ordersWithLines = await get();
  const db = await sandbox(t, import.meta.url, "bank.sql");
  await db.query("INSERT INTO shop_orders (customer_id, idempotency_key, total) SELECT i, 'k' || i, i FROM generate_series(1, 200) AS i");
  await db.query("INSERT INTO shop_order_lines SELECT i, 1 + i % 4, i, 1 FROM generate_series(1, 200) AS i");
  const { pool, counter } = countingPool(db.pool(3));
  const ids = Array.from({ length: 200 }, (_, i) => 200 - i);
  const out = await ordersWithLines(pool, ids);
  assert.deepEqual(out.map((o) => o.id), ids);
  assert.equal(out[0].lines[0].quantity, 200);
  assert.equal(counter.n, 2, "בדיוק שתי שאילתות גם ל־200");
  counter.n = 0;
  assert.deepEqual(await ordersWithLines(pool, []), []);
  assert.equal(counter.n, 0, "מערך ריק — בלי שאילתות");
});
