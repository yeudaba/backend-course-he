import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { activeProducts } = await load(import.meta.url, "P19-E06.ts");

test("מוצרים פעילים", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  const rows = await activeProducts(prisma);
  assert.equal(rows.length, 11);
  assert.deepEqual(rows.slice(0, 3), [{ name: "Paper Filters (100)", price: 24.9 }, { name: "Brazil Beans 250g", price: 29.9 }, { name: "Ceramic Mug", price: 39 }]);
  assert.deepEqual(rows.at(-1), { name: "Electric Grinder Pro", price: 649 });
  assert.ok(!rows.some((r) => r.name === "Digital Scale"), "לא פעיל");
});
