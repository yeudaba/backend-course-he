import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";
import { shop } from "./_shop.mjs";

test("P19-E47: pg ו־Prisma — אותה תוצאה, והתוצאה הנכונה", async (t) => {
  const { cheapWithPg, cheapWithPrisma } = await exportsOf(import.meta.url, "P19-E47.ts", ["cheapWithPg", "cheapWithPrisma"]);
  const { prisma, db } = await shop(t, import.meta.url);
  await db.query("UPDATE products SET price = 39 WHERE id = 9");
  const pool = db.pool(2);
  for (const max of [10, 40, 100, 189, 1000]) {
    const expected = await db.rows("SELECT id, name, stock FROM products WHERE is_active AND price < $1 ORDER BY price, id", [max]);
    assert.deepEqual(await cheapWithPg(pool, max), expected, `pg, max = ${max}`);
    assert.deepEqual(await cheapWithPrisma(prisma, max), expected, `Prisma, max = ${max}`);
  }
});
