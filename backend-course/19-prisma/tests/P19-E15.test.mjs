import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { cancelOrder } = await load(import.meta.url, "P19-E15.ts");

test("ביטול", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.equal(await cancelOrder(prisma, 11), 5, "Moka 1 + Mug 4");
  assert.equal((await prisma.order.findUnique({ where: { id: 11 } })).status, "cancelled");
  assert.equal((await prisma.product.findUnique({ where: { id: 8 } })).stock, 13);
  assert.equal((await prisma.product.findUnique({ where: { id: 10 } })).stock, 64);
  await assert.rejects(cancelOrder(prisma, 11), (e) => e.code === "ALREADY_CANCELLED");
  await assert.rejects(cancelOrder(prisma, 1), (e) => e.code === "CANNOT_CANCEL");
  await assert.rejects(cancelOrder(prisma, 99), (e) => e.code === "ORDER_NOT_FOUND");
});
test("שני ביטולים במקביל — המלאי חוזר פעם אחת", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const results = await Promise.allSettled([cancelOrder(prisma, 12), cancelOrder(prisma, 12), cancelOrder(prisma, 12)]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.ok(results.filter((r) => r.status === "rejected").every((r) => r.reason.code === "ALREADY_CANCELLED"));
  assert.equal((await prisma.product.findUnique({ where: { id: 1 } })).stock, 43);
});
