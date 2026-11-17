import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

const FILE = "P19-E81.ts";
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("עדכון חלקי", async (t) => {
  const { updateProduct } = await exportsOf(import.meta.url, FILE, ["updateProduct"]);
  const { prisma, db } = await shop(t, import.meta.url);
  assert.deepEqual(await updateProduct(prisma, 4, { price: 199.5 }), { id: 4, name: "Hand Grinder", price: 199.5, stock: 8, isActive: true });
  assert.deepEqual(await updateProduct(prisma, 4, { name: "Hand Grinder v2", isActive: false }), { id: 4, name: "Hand Grinder v2", price: 199.5, stock: 8, isActive: false });
  assert.deepEqual(await updateProduct(prisma, 4, { stock: 0 }), { id: 4, name: "Hand Grinder v2", price: 199.5, stock: 0, isActive: false }, "stock: 0 — מתעדכן (0 הוא ערך)");
  assert.deepEqual(await updateProduct(prisma, 4, {}), { id: 4, name: "Hand Grinder v2", price: 199.5, stock: 0, isActive: false });
  assert.equal(await updateProduct(prisma, 999, { price: 1 }), undefined);
  assert.deepEqual(await db.rows("SELECT name, price, stock, is_active FROM products WHERE id = 4"), [{ name: "Hand Grinder v2", price: 199.5, stock: 0, is_active: false }]);
  assert.deepEqual(await db.rows("SELECT price FROM products WHERE id = 5"), [{ price: 649 }], "מוצר אחר לא השתנה");
});
