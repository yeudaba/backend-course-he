import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { productsInCategory } = await load(import.meta.url, "P19-E07.ts");

test("לפי קטגוריה", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  assert.deepEqual(await productsInCategory(prisma, "beans"), ["Brazil Beans 250g", "Colombia Beans 1kg", "Ethiopia Beans 1kg"]);
  assert.deepEqual(await productsInCategory(prisma, "gift cards"), []);
  assert.deepEqual(await productsInCategory(prisma, "nope"), []);
});
