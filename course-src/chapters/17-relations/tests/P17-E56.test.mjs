import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E56.ts";
async function setup(t) {
  const { getOrderDetails } = await exportsOf(import.meta.url, FILE, ["getOrderDetails"]);
  const db = await sandbox(t, import.meta.url, "store.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  return { get: (id) => getOrderDetails(client, id), sent, db };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הזמנה עם פריטים — בשאילתה אחת, עם פרמטר", async (t) => {
  const { get, sent } = await setup(t);
  assert.deepEqual(await get(5), {
    id: 5, status: "shipped", customer: { id: 5, name: "Michal Biton" },
    items: [
      { product: "Ethiopia Beans 1kg", quantity: 1, unitPrice: 89.9 },
      { product: "Moka Pot 6 Cups", quantity: 1, unitPrice: 149 },
      { product: "Paper Filters (100)", quantity: 2, unitPrice: 24.9 },
    ],
  });
  assert.equal(sent.length, 1, "שאילתה אחת בלבד");
  assert.deepEqual(sent[0].values, [5], "orderId כפרמטר");
  assert.deepEqual((await get(10)).items, [{ product: "Hand Grinder", quantity: 1, unitPrice: 189 }]);
  assert.deepEqual((await get(10)).customer, { id: 3, name: "Noa Mizrahi" });
});
test("בלי פריטים ← items: [], לא קיימת ← null", async (t) => {
  const { get, db } = await setup(t);
  await db.query("DELETE FROM order_items WHERE order_id = 4");
  assert.deepEqual(await get(4), { id: 4, status: "cancelled", customer: { id: 3, name: "Noa Mizrahi" }, items: [] }, "הזמנה בלי פריטים — עדיין קיימת (LEFT JOIN)");
  assert.equal(await get(999), null);
});
