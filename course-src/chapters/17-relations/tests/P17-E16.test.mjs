import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("תגיות: רבים־לרבים", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E16.sql");
  await db.query("INSERT INTO tags (name) VALUES ('organic'), ('gift'), ('bestseller')");
  await db.query("INSERT INTO product_tags (product_id, tag_id) VALUES (1, 1), (1, 3), (10, 2), (3, 1)");
  const rows = await db.rows("SELECT p.name, t.name AS tag FROM product_tags pt JOIN products p ON p.id = pt.product_id JOIN tags t ON t.id = pt.tag_id ORDER BY p.id, t.id");
  assert.equal(rows.length, 4);
  await assert.rejects(db.query("INSERT INTO tags (name) VALUES ('gift')"), undefined, "שם תגית ייחודי");
  await assert.rejects(db.query("INSERT INTO tags (name) VALUES (NULL)"), undefined, "שם חובה");
  await assert.rejects(db.query("INSERT INTO product_tags VALUES (1, 1)"), undefined, "אותו זוג פעמיים");
  await assert.rejects(db.query("INSERT INTO product_tags VALUES (999, 1)"), undefined, "מוצר שלא קיים");
  await assert.rejects(db.query("INSERT INTO product_tags VALUES (1, 999)"), undefined, "תגית שלא קיימת");
  await db.query("DELETE FROM tags WHERE name = 'organic'");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM product_tags"))[0].n, 2, "מחיקת תגית מוחקת את הקישורים שלה");
  await db.query("DELETE FROM order_items WHERE product_id = 10");
  await db.query("DELETE FROM products WHERE id = 10");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM product_tags"))[0].n, 1, "מחיקת מוצר מוחקת את הקישורים שלו");
});
