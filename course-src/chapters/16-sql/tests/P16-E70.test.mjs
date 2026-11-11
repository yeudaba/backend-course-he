import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E70.ts";
async function setup(t) {
  const { inventoryReport } = await exportsOf(import.meta.url, FILE, ["inventoryReport"]);
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  return { report: (c) => (c === undefined ? inventoryReport(client) : inventoryReport(client, c)), sent, db };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("כל הפעילים", async (t) => {
  const { report, sent } = await setup(t);
  assert.deepEqual(await report(), { products: 12, units: 660, cheapest: 19.9, priciest: 649, avgPrice: 143.54 });
  assert.equal(sent.length, 1, "שאילתה אחת");
});
test("לפי קטגוריה, וקטגוריה ריקה", async (t) => {
  const { report, sent } = await setup(t);
  assert.deepEqual(await report("beans"), { products: 3, units: 160, cheapest: 29.9, priciest: 89.9, avgPrice: 68.23 });
  assert.deepEqual(await report("grinders"), { products: 2, units: 11, cheapest: 189, priciest: 649, avgPrice: 419 });
  assert.deepEqual(await report("tea"), { products: 0, units: 0, cheapest: null, priciest: null, avgPrice: null });
  assert.deepEqual(await report("x' OR '1'='1"), { products: 0, units: 0, cheapest: null, priciest: null, avgPrice: null }, "category כפרמטר");
  assert.ok(sent.every((s) => !s.text.includes("beans")), "category לא בתוך הטקסט");
});
test("אחרי שינוי בנתונים", async (t) => {
  const { report, db } = await setup(t);
  await db.query("UPDATE products SET stock = stock + 1000, price = 1000.10 WHERE id = 3");
  assert.deepEqual(await report("beans"), { products: 3, units: 1160, cheapest: 84.9, priciest: 1000.1, avgPrice: 391.63 });
});
