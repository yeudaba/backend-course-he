import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { seedDemoData } = await load(import.meta.url, "P19-E19.ts");

test("seed שאפשר להריץ שוב", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const first = await seedDemoData(prisma);
  const second = await seedDemoData(prisma);
  await seedDemoData(prisma);
  assert.deepEqual(second, first);
  assert.equal(await prisma.category.count(), 6);
  assert.equal(await prisma.product.count({ where: { categoryId: first.categoryId } }), 2);
  assert.equal(await prisma.product.count(), 14);
  assert.equal(await prisma.customer.count(), 9);
  const bottle = await prisma.product.findFirst({ where: { name: "Cold Brew Bottle 1L" } });
  assert.equal(Number(bottle.price), 59.9);
  assert.equal(bottle.stock, 20);
  const demo = await prisma.customer.findUnique({ where: { email: "demo@example.com" } });
  assert.equal(demo.id, first.customerId);
  assert.equal(demo.joinedOn.toISOString().slice(0, 10), "2026-01-01");
});
