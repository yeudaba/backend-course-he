import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { adjustStock } = await load(import.meta.url, "P19-E09.ts");

test("עדכון מלאי", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.equal(await adjustStock(prisma, 1, 10), 50);
  assert.equal(await adjustStock(prisma, 1, -15), 35);
  await assert.rejects(adjustStock(prisma, 99, 1), (e) => e.code === "PRODUCT_NOT_FOUND");
});
test("במקביל — אף עדכון לא אובד", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  await Promise.all(Array.from({ length: 20 }, () => adjustStock(prisma, 9, 1)));
  assert.equal((await prisma.product.findUnique({ where: { id: 9 } })).stock, 320);
});
