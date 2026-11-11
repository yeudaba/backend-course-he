import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P17-E45.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["normalize"])).normalize;

test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("לקוחות, מוצרים, הזמנות ופריטים", async () => {
  const normalize = await get();
  const out = normalize([
    { orderId: 7, email: "Dana@Example.com", fullName: "Dana Levi", items: [{ product: "Beans", price: 84.9, qty: 2 }, { product: "Filters", price: 24.9, qty: 1 }] },
    { orderId: 9, email: "yossi@example.com", fullName: "Yossi", items: [{ product: "Filters", price: 24.9, qty: 3 }] },
    { orderId: 12, email: "dana@example.com", fullName: "Dana L.", items: [{ product: "Mug", price: 39, qty: 1 }, { product: "Beans", price: 89.9, qty: 1 }, { product: "Mug", price: 39, qty: 2 }] },
  ]);
  assert.deepEqual(out.customers, [
    { id: 1, email: "dana@example.com", full_name: "Dana Levi" },
    { id: 2, email: "yossi@example.com", full_name: "Yossi" },
  ], "לקוח לכל אימייל (בלי הבדל אותיות), אימייל באותיות קטנות, השם מהפעם הראשונה");
  assert.deepEqual(out.products, [{ id: 1, name: "Beans" }, { id: 2, name: "Filters" }, { id: 3, name: "Mug" }]);
  assert.deepEqual(out.orders, [{ id: 7, customer_id: 1 }, { id: 9, customer_id: 2 }, { id: 12, customer_id: 1 }]);
  assert.deepEqual(out.order_items, [
    { order_id: 7, product_id: 1, quantity: 2, unit_price: 84.9 },
    { order_id: 7, product_id: 2, quantity: 1, unit_price: 24.9 },
    { order_id: 9, product_id: 2, quantity: 3, unit_price: 24.9 },
    { order_id: 12, product_id: 3, quantity: 3, unit_price: 39 },
    { order_id: 12, product_id: 1, quantity: 1, unit_price: 89.9 },
  ], "Mug פעמיים בהזמנה 12 ← שורה אחת עם כמות 3; Beans בהזמנה אחרת — שורה חדשה עם המחיר שלה");
});
test("קלט ריק והזמנה בלי פריטים", async () => {
  const normalize = await get();
  assert.deepEqual(normalize([]), { customers: [], products: [], orders: [], order_items: [] });
  const out = normalize([{ orderId: 1, email: "A@B.C", fullName: "A", items: [] }]);
  assert.deepEqual(out, { customers: [{ id: 1, email: "a@b.c", full_name: "A" }], products: [], orders: [{ id: 1, customer_id: 1 }], order_items: [] });
});
