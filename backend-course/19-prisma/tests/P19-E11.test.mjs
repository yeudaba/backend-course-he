import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { customerOrders } = await load(import.meta.url, "P19-E11.ts");

test("לקוח עם הזמנות", async (t) => {
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  const before = queries.length;
  const r = await customerOrders(prisma, 1);
  assert.ok(queries.length - before <= 4, `${queries.length - before} שאילתות`);
  assert.equal(r.fullName, "Dana Levi");
  assert.deepEqual(r.orders.map((o) => o.id), [1, 3, 8]);
  assert.deepEqual(r.orders[0], { id: 1, status: "shipped", items: [{ product: "Ethiopia Beans 1kg", quantity: 2, unitPrice: 84.9 }, { product: "Paper Filters (100)", quantity: 1, unitPrice: 24.9 }] });
  assert.deepEqual(r.orders[2].items.map((i) => i.product), ["Brazil Beans 250g", "Ceramic Mug"]);
  assert.deepEqual(await customerOrders(prisma, 4), { fullName: "Avi Peretz", orders: [] });
  assert.equal(await customerOrders(prisma, 99), null);
});
