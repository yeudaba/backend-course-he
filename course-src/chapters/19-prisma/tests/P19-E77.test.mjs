import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E77.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["toApiOrder"])).toApiOrder;
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("ממיר הזמנות אמיתיות מ־Prisma", async (t) => {
  const toApiOrder = await get();
  const { prisma } = await shop(t, import.meta.url);
  const o5 = await prisma.order.findUniqueOrThrow({ where: { id: 5 }, include: { items: true } });
  assert.deepEqual(toApiOrder(o5), {
    id: 5, customerId: 5, status: "shipped", createdAt: "2026-02-20T06:30:00.000Z",
    items: [{ productId: 1, quantity: 1, unitPrice: 89.9 }, { productId: 8, quantity: 1, unitPrice: 149 }, { productId: 9, quantity: 2, unitPrice: 24.9 }],
    total: 288.7,
  });
  const o2 = await prisma.order.findUniqueOrThrow({ where: { id: 2 }, include: { items: true } });
  assert.equal(toApiOrder(o2).total, 278.7);
});
test("סדר, דיוק והמקור לא משתנה", async () => {
  const toApiOrder = await get();
  const items = [{ productId: 9, quantity: 3, unitPrice: 19.9 }, { productId: 2, quantity: 1, unitPrice: 0.1 }, { productId: 4, quantity: 1, unitPrice: 0.2 }];
  const o = { id: 1, customerId: 2, status: "paid", createdAt: new Date("2026-01-01T00:00:00Z"), items };
  const out = toApiOrder(o);
  assert.deepEqual(out.items.map((i) => i.productId), [2, 4, 9]);
  assert.equal(out.total, 60, "59.7 + 0.1 + 0.2 = 60 בדיוק");
  assert.deepEqual(items.map((i) => i.productId), [9, 2, 4], "המערך המקורי לא מוין");
  assert.deepEqual(toApiOrder({ ...o, items: [] }).total, 0);
});
