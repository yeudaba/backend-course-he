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
test("בלי לבדוק מראש — שאילתת מחיקה אחת, והשגיאה של Prisma מתורגמת", async (t) => {
  const { prisma, queries } = await shop(t, import.meta.url, { log: true });
  await deleteCategory(prisma, 5);
  await assert.rejects(deleteCategory(prisma, 1), (e) => e.code === "CATEGORY_NOT_EMPTY");
  await assert.rejects(deleteCategory(prisma, 99), (e) => e.code === "CATEGORY_NOT_FOUND");
  const reads = queries.filter((q) => /^\s*SELECT/i.test(q) && !/RETURNING/i.test(q));
  assert.equal(reads.length, 0, `נשלחו ${reads.length} שאילתות SELECT לפני המחיקה — המשימה: בלי לבדוק מראש (findUnique/count). מחק, ותרגם את P2025 ו־P2003 של Prisma`);
});
