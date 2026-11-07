import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { catalogStats } = await load(import.meta.url, "P19-E16.ts");

test("נתוני דשבורד", async (t) => {
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  const r = await catalogStats(prisma);
  assert.deepEqual(r, { products: 12, active: 11, outOfStock: 2, avgActivePrice: 154.78, byCategory: { beans: 3, grinders: 2, brewing: 4, accessories: 3, "gift cards": 0 } });
  assert.ok(!queries.some((q) => /FROM "[^"]+"\."products"(?!.*WHERE).*$/.test(q) && !/COUNT|AVG|count|avg/.test(q)), "בלי להביא את כל המוצרים");
});
