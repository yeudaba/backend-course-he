import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { placeOrder } = await load(import.meta.url, "P19-E14.ts");

test("הזמנה", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const r = await placeOrder(prisma, 4, [{ productId: 1, quantity: 2 }, { productId: 9, quantity: 3 }]);
  assert.deepEqual(r, { orderId: 13, total: 254.5 });
  const order = await prisma.order.findUnique({ where: { id: 13 }, include: { items: { orderBy: { productId: "asc" } } } });
  assert.equal(order.status, "pending");
  assert.deepEqual(order.items.map((i) => [i.productId, i.quantity, Number(i.unitPrice)]), [[1, 2, 89.9], [9, 3, 24.9]]);
  assert.equal((await prisma.product.findUnique({ where: { id: 1 } })).stock, 38);
});
test("חסר מלאי — שום דבר לא משתנה", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  await assert.rejects(placeOrder(prisma, 4, [{ productId: 1, quantity: 1 }, { productId: 7, quantity: 1 }]), (e) => e.code === "OUT_OF_STOCK");
  assert.equal((await prisma.product.findUnique({ where: { id: 1 } })).stock, 40, "המלאי של המוצר הראשון חזר");
  assert.equal(await prisma.order.count(), 12);
});
test("5 הזמנות במקביל, 3 במלאי", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const results = await Promise.allSettled(Array.from({ length: 5 }, (_, i) => placeOrder(prisma, i + 1, [{ productId: 5, quantity: 1 }])));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.equal((await prisma.product.findUnique({ where: { id: 5 } })).stock, 0);
});
