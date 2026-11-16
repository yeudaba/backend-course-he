import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { defineTools } = await load(import.meta.url, "P29-E65.ts");

test("ממיר spec להגדרת כלי קשוחה", () => {
  const tools = defineTools([
    { name: "get_order", description: "Get one of the current customer's orders.", params: { order_id: "integer" } },
    { name: "search_products", description: "Search the catalog.", params: { query: "string", in_stock: "boolean", max_price: "number" } },
    { name: "list_my_orders", description: "List my orders.", params: {} },
  ]);
  assert.deepEqual(tools, [
    { name: "get_order", description: "Get one of the current customer's orders.", strict: true, input_schema: { type: "object", properties: { order_id: { type: "integer" } }, required: ["order_id"], additionalProperties: false } },
    {
      name: "search_products",
      description: "Search the catalog.",
      strict: true,
      input_schema: { type: "object", properties: { query: { type: "string" }, in_stock: { type: "boolean" }, max_price: { type: "number" } }, required: ["query", "in_stock", "max_price"], additionalProperties: false },
    },
    { name: "list_my_orders", description: "List my orders.", strict: true, input_schema: { type: "object", properties: {}, required: [], additionalProperties: false } },
  ]);
  assert.deepEqual(defineTools([]), []);
});
test("שמות, תיאורים וטיפוסים לא תקינים ← שגיאה", () => {
  const ok = { description: "x", params: {} };
  for (const name of ["get order", "", "x".repeat(65), "הזמנה", "a.b"]) assert.throws(() => defineTools([{ name, ...ok }]), Error, `שם: "${name}"`);
  assert.doesNotThrow(() => defineTools([{ name: "a-B_9", ...ok }, { name: "x".repeat(64), ...ok }]));
  assert.throws(() => defineTools([{ name: "a", ...ok }, { name: "a", ...ok }]), Error, "שם כפול");
  assert.throws(() => defineTools([{ name: "a", description: "   ", params: {} }]), Error, "תיאור ריק");
  assert.throws(() => defineTools([{ name: "a", description: "x", params: { q: "object" } }]), Error, "טיפוס לא מוכר");
});
test("פרמטר שמזהה משתמש ← שגיאה שמסבירה", () => {
  for (const p of ["user_id", "userId", "USER_ID", "customer_id", "customerId", "owner_id", "ownerid"]) {
    assert.throws(() => defineTools([{ name: "get_order", description: "x", params: { order_id: "integer", [p]: "integer" } }]), /מהקוד|JWT/, p);
  }
  assert.doesNotThrow(() => defineTools([{ name: "t", description: "x", params: { order_id: "integer", product_id: "integer", user_name_hint: "string" } }]));
});
