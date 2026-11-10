import { test } from "node:test";
import assert from "node:assert/strict";
import { shop } from "./_shop.mjs";
import { exportsOf, code } from "./_ts.mjs";

const FILE = "P19-E28.ts";
const get = () => exportsOf(import.meta.url, FILE, ["PrismaCategoryRepository", "ConflictError", "NotFoundError"]);

test("list — לפי שם, עם מספר מוצרים", async (t) => {
  const { PrismaCategoryRepository } = await get();
  const { prisma } = await shop(t, import.meta.url);
  const repo = new PrismaCategoryRepository(prisma);
  assert.deepEqual(await repo.list(), [
    { id: 4, name: "accessories", productCount: 3 },
    { id: 1, name: "beans", productCount: 3 },
    { id: 3, name: "brewing", productCount: 4 },
    { id: 5, name: "gift cards", productCount: 0 },
    { id: 2, name: "grinders", productCount: 2 },
  ]);
  assert.deepEqual(Object.keys(repo), [], `יש שדות ציבוריים (${Object.keys(repo).join(", ")}) — שמור את ה־client בשדה פרטי (#prisma)`);
});
test("create ו־rename", async (t) => {
  const { PrismaCategoryRepository } = await get();
  const { prisma } = await shop(t, import.meta.url);
  const repo = new PrismaCategoryRepository(prisma);
  assert.deepEqual(await repo.create("  tea  "), { id: 6, name: "tea", productCount: 0 }, "השם נשמר אחרי trim");
  assert.deepEqual(await repo.rename(1, "coffee beans"), { id: 1, name: "coffee beans", productCount: 3 });
});
test("שגיאות משלך במקום שגיאות של Prisma", async (t) => {
  const { PrismaCategoryRepository, ConflictError, NotFoundError } = await get();
  const { prisma } = await shop(t, import.meta.url);
  const repo = new PrismaCategoryRepository(prisma);
  await assert.rejects(repo.create("beans"), (e) => e instanceof ConflictError && e.message === "קטגוריה בשם beans כבר קיימת", "שם קיים (P2002) ← ConflictError");
  await assert.rejects(repo.rename(2, " brewing "), (e) => e instanceof ConflictError && e.message === "קטגוריה בשם brewing כבר קיימת");
  await assert.rejects(repo.rename(99, "x"), (e) => e instanceof NotFoundError && e.message === "קטגוריה 99 לא קיימת", "id לא קיים (P2025) ← NotFoundError");
  await assert.rejects(repo.create("   "), (e) => e instanceof RangeError && e.message === "שם קטגוריה ריק");
  const err = new ConflictError("x");
  assert.ok(err instanceof Error, "ConflictError צריכה לרשת מ־Error (extends Error)");
  assert.equal(err.name, "ConflictError", "this.name = \"ConflictError\" — כך השם מופיע בלוגים");
  assert.equal(new NotFoundError("x").name, "NotFoundError");
});
test("interface, ‏implements ו־switch", () => {
  const src = code(import.meta.url, FILE);
  assert.match(src, /\binterface\s+CategoryRepository\b/, "הגדר interface CategoryRepository (פרק 12)");
  assert.match(src, /\bclass\s+PrismaCategoryRepository\s+implements\s+CategoryRepository\b/, "המחלקה צריכה לממש את ה־interface: class PrismaCategoryRepository implements CategoryRepository");
  assert.match(src, /\bswitch\s*\(/, "התרגיל מתרגל switch (פרק 4): מקוד שגיאה של Prisma לשגיאה שלך");
});
