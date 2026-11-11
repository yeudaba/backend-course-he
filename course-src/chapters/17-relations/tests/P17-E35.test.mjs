import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E35: הרשימה (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E35.sql");
});
test("P17-E35: האילוצים של wishlist_items", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E35.sql");
  await assert.rejects(db.query("INSERT INTO wishlist_items (customer_id, product_id) VALUES (4, 5)"), undefined, "אותו מוצר פעמיים אצל אותו לקוח");
  await assert.rejects(db.query("INSERT INTO wishlist_items (customer_id, product_id) VALUES (4, 99)"), undefined, "מוצר שלא קיים");
  await assert.rejects(db.query("INSERT INTO wishlist_items (customer_id, product_id) VALUES (99, 1)"), undefined, "לקוח שלא קיים");
  await assert.rejects(db.query("INSERT INTO wishlist_items (customer_id) VALUES (1)"), undefined, "product_id חובה");
  await assert.rejects(db.query("INSERT INTO wishlist_items (product_id) VALUES (1)"), undefined, "customer_id חובה");
  const [row] = await db.rows("INSERT INTO wishlist_items (customer_id, product_id) VALUES (1, 5) RETURNING added_on = CURRENT_DATE AS today");
  assert.equal(row.today, true, "added_on — ברירת מחדל: היום");
  await assert.rejects(db.query("DELETE FROM products WHERE id = 5"), undefined, "מחיקת מוצר שברשימה של מישהו — צריכה להיחסם");
  await db.query("DELETE FROM customers WHERE id = 8");
  const left = await db.rows("SELECT COUNT(*) AS n FROM wishlist_items WHERE customer_id = 8");
  assert.equal(left[0].n, 0, "מחיקת לקוח צריכה למחוק את הרשימה שלו (ON DELETE CASCADE)");
});
