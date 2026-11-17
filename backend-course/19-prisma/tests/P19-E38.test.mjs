import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

test("P19-E38: שמות לפי א״ב", async (t) => {
  const { productNames } = await exportsOf(import.meta.url, "P19-E38.ts", ["productNames"]);
  const { prisma, db } = await shop(t, import.meta.url);
  const names = await productNames(prisma);
  assert.equal(names.length, 12, "כל 12 המוצרים — גם Digital Scale הלא פעיל");
  assert.deepEqual(names.slice(0, 3), ["Brazil Beans 250g", "Ceramic Mug", "Colombia Beans 1kg"]);
  await db.query("INSERT INTO products (name, category_id, price) VALUES ('AeroPress', 3, 139), ('Zebra Mug', 4, 45)");
  const after = await productNames(prisma);
  assert.equal(after[0], "AeroPress");
  assert.equal(after.at(-1), "Zebra Mug");
});
