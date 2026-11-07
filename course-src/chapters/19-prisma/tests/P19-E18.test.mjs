import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { setProductTags } = await load(import.meta.url, "P19-E18.ts");

test("תגיות", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.deepEqual(await setProductTags(prisma, 1, [" Organic", "fair trade", "organic", "", "Single Origin "]), ["fair trade", "organic", "single origin"]);
  assert.equal(await prisma.tag.count(), 5, "נוצרו 2 תגיות חדשות");
  const tags = await prisma.productTag.findMany({ where: { productId: 1 }, include: { tag: true } });
  assert.deepEqual(tags.map((x) => x.tag.name).sort(), ["fair trade", "organic", "single origin"], "bestseller הוסרה");
  assert.deepEqual(await setProductTags(prisma, 1, []), []);
  assert.equal(await prisma.productTag.count({ where: { productId: 1 } }), 0);
  assert.equal(await prisma.productTag.count({ where: { productId: 3 } }), 1, "מוצרים אחרים לא הושפעו");
  await assert.rejects(setProductTags(prisma, 99, ["x"]), (e) => e.code === "PRODUCT_NOT_FOUND");
  assert.equal(await prisma.tag.count({ where: { name: "x" } }), 0, "ה־transaction בוטל");
});
