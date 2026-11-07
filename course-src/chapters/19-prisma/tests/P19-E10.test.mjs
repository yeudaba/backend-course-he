import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { searchProducts } = await load(import.meta.url, "P19-E10.ts");

test("חיפוש", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  let r = await searchProducts(prisma, { q: "BEANS" });
  assert.deepEqual(r, { data: [{ id: 3, name: "Brazil Beans 250g", price: 29.9 }, { id: 2, name: "Colombia Beans 1kg", price: 84.9 }, { id: 1, name: "Ethiopia Beans 1kg", price: 89.9 }], total: 3 });
  r = await searchProducts(prisma, { minPrice: 99, maxPrice: 189, limit: 2, page: 2 });
  assert.equal(r.total, 4);
  assert.deepEqual(r.data.map((p) => p.id), [8, 4]);
  r = await searchProducts(prisma);
  assert.equal(r.total, 11, "רק פעילים");
  assert.equal(r.data.length, 10);
  assert.deepEqual((await searchProducts(prisma, { page: 2 })).data.map((p) => p.id), [5]);
});
