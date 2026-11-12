import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E60.ts", ["buildOrder"])).buildOrder;
const P = [{ _id: "p1", name: "Ethiopia", price: 62, stock: 40 }, { _id: "p5", name: "V60", price: 89, stock: 12 }, { _id: "p8", name: "Mug", price: 35, stock: 0 }];
const now = new Date("2026-11-07T12:00:00Z");

test("הזמנה, עותק ואיחוד", async () => {
  const f = await get();
  const products = structuredClone(P);
  const o = f(products, [{ productId: "p5", qty: 1 }, { productId: "p1", qty: 2 }, { productId: "p5", qty: 2 }], "c1", now);
  assert.deepEqual(o, { customerId: "c1", status: "pending", createdAt: now, items: [{ productId: "p5", name: "V60", price: 89, qty: 3 }, { productId: "p1", name: "Ethiopia", price: 62, qty: 2 }], total: 391 });
  products[1].price = 999;
  assert.equal(o.items[0].price, 89, "עותק — לא הפניה");
});
test("שגיאות", async () => {
  const f = await get();
  assert.throws(() => f(P, [], "c1", now), { message: "EMPTY_CART" });
  assert.throws(() => f(P, [{ productId: "p9", qty: 1 }], "c1", now), { message: "UNKNOWN_PRODUCT p9" });
  for (const qty of [0, -1, 1.5]) assert.throws(() => f(P, [{ productId: "p1", qty }], "c1", now), RangeError);
});
