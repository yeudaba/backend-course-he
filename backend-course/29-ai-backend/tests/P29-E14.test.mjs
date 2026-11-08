import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { fakeClaude, message, toolUse, thinking, userText } from "./_claude.mjs";

const { TOOLS, createShopHandlers } = await load(import.meta.url, "P29-E14.ts");
const orders = [
  { id: 1, userId: 7, status: "paid", totalCents: 18900 },
  { id: 2, userId: 8, status: "shipped", totalCents: 64900 },
  { id: 3, userId: 7, status: "pending_payment", totalCents: 2490 },
];
const db = {
  findOrder: async (id) => orders.find((o) => o.id === id),
  ordersOf: async (u) => orders.filter((o) => o.userId === u).reverse(),
  searchProducts: async (q) => Array.from({ length: 9 }, (_, i) => ({ id: i, name: `${q} ${i}`, priceCents: 100 * i, stock: i })),
};

test("הגדרות הכלים: strict, additionalProperties: false", () => {
  assert.deepEqual(TOOLS.map((t) => t.name).sort(), ["get_order", "list_my_orders", "search_products"]);
  for (const t of TOOLS) {
    assert.equal(t.strict, true, t.name);
    assert.equal(t.input_schema.additionalProperties, false, t.name);
    assert.ok(t.description.length > 10, t.name);
  }
});
test("get_order: רק של המשתמש המחובר; של אחר ← כמו 'לא נמצא'", async () => {
  const h = createShopHandlers({ id: 7 }, db);
  assert.equal(JSON.parse(await h.get_order({ order_id: 1 })).id, 1);
  await assert.rejects(h.get_order({ order_id: 2 }), /לא נמצאה/);
  await assert.rejects(h.get_order({ order_id: 99 }), /לא נמצאה/);
  await assert.rejects(h.get_order({ order_id: 2, user_id: 8 }), "user_id מהמודל לא משנה כלום");
});
test("list_my_orders — רק שלו; search — עד 5; קלט לא תקין ← שגיאה", async () => {
  const h = createShopHandlers({ id: 7 }, db);
  assert.deepEqual(JSON.parse(await h.list_my_orders({})).map((o) => o.id), [3, 1]);
  assert.equal(JSON.parse(await h.search_products({ query: "V60" })).length, 5);
  await assert.rejects(h.search_products({ query: "" }));
  await assert.rejects(h.get_order({ order_id: "1; DROP TABLE" }));
});
