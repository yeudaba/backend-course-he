import { test } from "node:test";
import assert from "node:assert/strict";
import { load, typecheck } from "../../tools/load.mjs";

const { OrderService, MemoryRepo, NotFoundError, ConflictError, ValidationError } = await load(import.meta.url, "P12-E16.ts");

test("עובר בדיקת טיפוסים (tsc --strict)", () => { const r = typecheck(import.meta.url, "P12-E16.ts"); assert.ok(r.ok, r.output); });
async function setup() {
  const products = new MemoryRepo(); const orders = new MemoryRepo();
  await products.save({ id: 1, name: "עט", price: 5, stock: 10 });
  await products.save({ id: 2, name: "תיק", price: 100, stock: 1 });
  const svc = new OrderService({ products, orders, now: () => new Date("2026-11-01T10:00:00Z") });
  return { products, orders, svc };
}
test("הזמנה מוצלחת עם צילום מחיר", async () => {
  const { products, orders, svc } = await setup();
  const o = await svc.placeOrder(7, [{ productId: 1, qty: 3 }, { productId: 2, qty: 1 }]);
  assert.equal(o.id, 1); assert.equal(o.userId, 7); assert.equal(o.total, 115);
  assert.deepEqual(o.lines, [{ productId: 1, qty: 3, unitPrice: 5 }, { productId: 2, qty: 1, unitPrice: 100 }]);
  assert.equal(o.createdAt.toISOString(), "2026-11-01T10:00:00.000Z");
  assert.equal((await products.findById(1)).stock, 7);
  await products.save({ id: 1, name: "עט", price: 999, stock: 7 });
  assert.equal((await orders.findById(1)).lines[0].unitPrice, 5);
});
test("שגיאות", async () => {
  const { svc } = await setup();
  await assert.rejects(svc.placeOrder(1, []), ValidationError);
  await assert.rejects(svc.placeOrder(1, [{ productId: 9, qty: 1 }]), NotFoundError);
  await assert.rejects(svc.placeOrder(1, [{ productId: 2, qty: 2 }]), ConflictError);
});
test("הכול או כלום", async () => {
  const { products, orders, svc } = await setup();
  await assert.rejects(svc.placeOrder(1, [{ productId: 1, qty: 2 }, { productId: 2, qty: 5 }]));
  assert.equal((await products.findById(1)).stock, 10);
  assert.equal(await orders.count(), 0);
});
