import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { transferStock } = await load(import.meta.url, "P19-E23.ts");

test("העברת מלאי", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  await transferStock(prisma, 3, 1, 20);
  assert.equal((await prisma.product.findUnique({ where: { id: 3 } })).stock, 100);
  assert.equal((await prisma.product.findUnique({ where: { id: 1 } })).stock, 60);
  await assert.rejects(transferStock(prisma, 7, 1, 1), (e) => e.code === "OUT_OF_STOCK");
  assert.equal((await prisma.product.findUnique({ where: { id: 1 } })).stock, 60, "היעד לא קיבל כלום");
});
