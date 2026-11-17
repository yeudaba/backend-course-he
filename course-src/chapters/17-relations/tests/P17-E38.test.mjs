import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E38: הקטגוריות בסוף", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E38.sql");
});
test("P17-E38: שורה אחת שונתה, products לא נגעו", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E38.sql");
  const cats = await db.rows("SELECT id, name FROM categories ORDER BY id");
  assert.deepEqual(cats.map((c) => c.name), ["coffee beans", "grinders", "brewing", "accessories", "gift cards", "tea"]);
  const beans = await db.rows("SELECT id, category_id FROM products WHERE category_id = 1 ORDER BY id");
  assert.deepEqual(beans.map((p) => p.id), [1, 2, 3], "המוצרים של קטגוריה 1 לא זזו");
});
