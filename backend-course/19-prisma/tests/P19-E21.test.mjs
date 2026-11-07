import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { buy } = await load(import.meta.url, "P19-E21.ts");

test("קנייה ושגיאות", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.equal(await buy(prisma, 1, 5), 35);
  await assert.rejects(buy(prisma, 7, 1), (e) => e.code === "OUT_OF_STOCK");
  await assert.rejects(buy(prisma, 99, 1), (e) => e.code === "PRODUCT_NOT_FOUND");
});
test("10 קונים, 3 מטחנות", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const results = await Promise.allSettled(Array.from({ length: 10 }, () => buy(prisma, 5, 1)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.equal((await prisma.product.findUnique({ where: { id: 5 } })).stock, 0);
});
