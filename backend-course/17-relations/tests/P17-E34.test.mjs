import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { sameAsSolution } from "./_compare.mjs";

test("P17-E34: הכתובות (עמודות, שורות וסדר)", async (t) => {
  await sameAsSolution(t, import.meta.url, "P17-E34.sql");
});
test("P17-E34: האילוצים של addresses", async (t) => {
  const db = await sandbox(t, import.meta.url, "store.sql");
  await db.runFile("P17-E34.sql");
  await assert.rejects(db.query("INSERT INTO addresses (customer_id, city, street) VALUES (99, 'Acre', 'Sea 1')"), undefined, "כתובת של לקוח שלא קיים — ה־FK היה צריך לחסום");
  await assert.rejects(db.query("INSERT INTO addresses (city, street) VALUES ('Acre', 'Sea 1')"), undefined, "כתובת בלי לקוח — customer_id חובה");
  await assert.rejects(db.query("INSERT INTO addresses (customer_id, street) VALUES (2, 'Sea 1')"), undefined, "city חובה");
  await assert.rejects(db.query("INSERT INTO addresses (customer_id, city) VALUES (2, 'Acre')"), undefined, "street חובה");
  await assert.rejects(db.query("INSERT INTO addresses (id, customer_id, city, street) VALUES (50, 2, 'Acre', 'Sea 1')"), undefined, "id — רק המסד ממספר (GENERATED ALWAYS)");
  const [row] = await db.rows("INSERT INTO addresses (customer_id, city, street) VALUES (2, 'Acre', 'Sea 1') RETURNING is_default");
  assert.equal(row.is_default, false, "is_default — ברירת מחדל false");
  await assert.rejects(db.query("INSERT INTO addresses (customer_id, city, street, is_default) VALUES (2, 'Acre', 'Sea 2', NULL)"), undefined, "is_default חובה (NOT NULL)");
  await db.query("DELETE FROM customers WHERE id = 8");
  const left = await db.rows("SELECT COUNT(*) AS n FROM addresses WHERE customer_id = 8");
  assert.equal(left[0].n, 0, "מחיקת לקוח צריכה למחוק את הכתובות שלו (ON DELETE CASCADE)");
});
