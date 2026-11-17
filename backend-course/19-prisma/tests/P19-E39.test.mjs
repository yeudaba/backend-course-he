import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

test("P19-E39: כמו ה־SQL", async (t) => {
  const { lowStock } = await exportsOf(import.meta.url, "P19-E39.ts", ["lowStock"]);
  const { prisma, db } = await shop(t, import.meta.url);
  await db.query("UPDATE products SET stock = 3 WHERE id IN (6, 12)");
  for (const below of [1, 5, 10, 50]) {
    const expected = await db.rows("SELECT id, name, stock FROM products WHERE is_active AND stock < $1 ORDER BY stock, id", [below]);
    assert.deepEqual(await lowStock(prisma, below), expected, `below = ${below}`);
  }
});
