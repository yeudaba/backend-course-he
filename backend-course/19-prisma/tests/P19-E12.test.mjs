import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { shop } from "./_shop.mjs";

const { deleteCategory } = await load(import.meta.url, "P19-E12.ts");

test("מחיקת קטגוריה", async (t) => {
  const { prisma } = await shop(t, import.meta.url);
  await assert.rejects(deleteCategory(prisma, 1), (e) => e.code === "CATEGORY_NOT_EMPTY");
  await assert.rejects(deleteCategory(prisma, 99), (e) => e.code === "CATEGORY_NOT_FOUND");
  await deleteCategory(prisma, 5);
  assert.equal(await prisma.category.count(), 4);
});
