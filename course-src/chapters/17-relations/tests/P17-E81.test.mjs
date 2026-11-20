import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E81: הביקורות (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E81.sql");
});
test("P17-E81: האילוצים של reviews", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E81.sql");
  await assert.rejects(db.query("INSERT INTO reviews (customer_id, rating) VALUES (1, 4)"), undefined, "ביקורת בלי מוצר — product_id חובה (NOT NULL)");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (99, 1, 4)"), undefined, "מוצר שלא קיים");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 1, 6)"), undefined, "rating 6");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (5, 4, 2)"), undefined, "לקוח 4 כבר כתב ביקורת למוצר 5 — צריך UNIQUE על הזוג");
  await db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 8, 2)");
  await assert.rejects(db.query("DELETE FROM customers WHERE id = 8"), undefined, "מחיקת לקוח עם ביקורות צריכה להיחסם");
  const [{ n: before }] = await db.rows("SELECT COUNT(*)::int AS n FROM reviews WHERE customer_id = 8");
  assert.equal(before, 2, "הביקורות של לקוח 8 נמחקו — אסור");
});
test("P17-E81: מחיקת מוצר מוחקת את הביקורות שלו", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E81.sql");
  await db.query("DELETE FROM order_items WHERE product_id = 1");
  await db.query("DELETE FROM products WHERE id = 1");
  const [{ n }] = await db.rows("SELECT COUNT(*)::int AS n FROM reviews WHERE product_id = 1");
  assert.equal(n, 0, "מחיקת מוצר צריכה למחוק את הביקורות שלו (ON DELETE CASCADE)");
});
