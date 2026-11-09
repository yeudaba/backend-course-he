import { test } from "node:test";
import assert from "node:assert/strict";
import { mysqlSandbox } from "../../tools/mysql.mjs";

test("קיים ← מוסיף לכמות, בכל הרצה; בלי warnings", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P25.5-E08.sql");
  assert.deepEqual(await db.rows("SHOW WARNINGS"), [], "בלי warnings — VALUES() ב־UPDATE מיושן; alias לשורה החדשה");
  await db.runFile("P25.5-E08.sql");
  assert.equal((await db.rows("SELECT quantity FROM cart_items WHERE customer_id = 1 AND product_id = 3"))[0].quantity, 6, "2 + 2 + 2");
  assert.equal((await db.rows("SELECT COUNT(*) n FROM cart_items"))[0].n, 3, "לא נוספו שורות");
});
test("לא קיים ← נוצר", async (t) => {
  const db = await mysqlSandbox(t, import.meta.url, "shop.sql");
  await db.query("DELETE FROM cart_items WHERE customer_id = 1 AND product_id = 3");
  await db.runFile("P25.5-E08.sql");
  assert.equal((await db.rows("SELECT quantity FROM cart_items WHERE customer_id = 1 AND product_id = 3"))[0].quantity, 2);
});
