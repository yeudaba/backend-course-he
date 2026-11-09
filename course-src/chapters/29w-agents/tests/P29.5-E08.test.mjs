import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { connect } from "./_mcp.mjs";

const { createCoffeeMcpServer } = await load(import.meta.url, "P29.5-E08.ts");
const { createStore } = await import("../files/store.ts");

test("שלושה כלים, עם תיאורים שמודל יכול לעבוד איתם", async (t) => {
  const { client } = await connect(t, createCoffeeMcpServer(createStore(), 1));
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((x) => x.name).sort(), ["get_order", "list_my_orders", "search_products"]);
  for (const x of tools) assert.ok((x.description ?? "").length >= 20, `${x.name}: תיאור קצר מדי`);
  assert.deepEqual(tools.find((x) => x.name === "get_order").inputSchema.required, ["orderId"]);
});
test("search_products: לפי שם, לא רגיש לרישיות, עם מחיר בשקלים ומלאי", async (t) => {
  const { call } = await connect(t, createCoffeeMcpServer(createStore(), 1));
  const r = await call("search_products", { query: "ethiopia" });
  assert.deepEqual(JSON.parse(r.text), [{ id: 2, name: "Ethiopia Yirgacheffe 250g", price: 54.9, inStock: false }]);
  assert.equal((await call("search_products", { query: "x" })).isError, true, "שאילתה קצרה מדי ← שגיאת קלט");
});
test("get_order ו־list_my_orders — רק של הלקוח המחובר", async (t) => {
  const { call } = await connect(t, createCoffeeMcpServer(createStore(), 1));
  assert.deepEqual(JSON.parse((await call("get_order", { orderId: 101 })).text), { id: 101, status: "paid", total: 89.9, items: [{ product: "Colombia Supremo 1kg", quantity: 1 }] });
  const other = await call("get_order", { orderId: 201 });
  assert.equal(other.isError, true, "הזמנה של לקוח 2");
  assert.doesNotMatch(other.text, /V60|69/, "בלי לחשוף פרטים");
  assert.equal((await call("get_order", { orderId: 999 })).isError, true);
  assert.deepEqual(JSON.parse((await call("list_my_orders", {})).text).map((o) => o.id), [102, 101]);
});
