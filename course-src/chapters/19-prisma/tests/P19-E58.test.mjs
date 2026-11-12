import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { fromSchema, columns } from "./_cols.mjs";

test("P19-E58: התוספות", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E58.prisma");
  const cust = await columns(db, "customers");
  assert.equal(cust.is_vip, "boolean NOT NULL DEFAULT false", "customers.is_vip");
  const prod = await columns(db, "products");
  assert.equal(prod.sku, "text", "products.sku — טקסט לא חובה");
  assert.deepEqual(await columns(db, "reviews"), {
    created_at: "timestamp with time zone NOT NULL DEFAULT now", customer_id: "integer NOT NULL", id: "integer NOT NULL DEFAULT autoincrement",
    product_id: "integer NOT NULL", rating: "integer NOT NULL", text: "text",
  });
  await db.query(`INSERT INTO categories (name) VALUES ('beans');
    INSERT INTO products (name, category_id, price) VALUES ('A', 1, 10), ('B', 1, 20), ('C', 1, 30);
    INSERT INTO customers (full_name, email, joined_on) VALUES ('X', 'x@x', '2026-01-01'), ('Y', 'y@x', '2026-01-01')`);
  await db.query("UPDATE products SET sku = 'S-1' WHERE id = 1");
  await assert.rejects(db.query("UPDATE products SET sku = 'S-1' WHERE id = 2"), undefined, "sku ייחודי");
  await db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 1, 5), (2, 1, 4), (1, 2, 3)");
  await assert.rejects(db.query("INSERT INTO reviews (product_id, customer_id, rating) VALUES (1, 1, 2)"), undefined, "ביקורת אחת לזוג");
  await assert.rejects(db.query("DELETE FROM customers WHERE id = 2"), undefined, "מחיקת לקוח עם ביקורת — נחסמת");
  await db.query("DELETE FROM products WHERE id = 1");
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM reviews"))[0].n, 1, "מחיקת מוצר ← הביקורות שלו");
});
test("P19-E58: שאר הטבלאות — בלי שינוי", async (t) => {
  const db = await fromSchema(t, import.meta.url, "P19-E58.prisma");
  const ref = await sandbox(t, import.meta.url);
  await ref.applyMigrations();
  for (const table of ["categories", "orders", "order_items", "tags", "product_tags"]) assert.deepEqual(await columns(db, table), await columns(ref, table), table);
  const p = await columns(db, "products");
  delete p.sku;
  assert.deepEqual(p, await columns(ref, "products"), "products — רק sku נוסף");
  const c = await columns(db, "customers");
  delete c.is_vip;
  assert.deepEqual(c, await columns(ref, "customers"), "customers — רק is_vip נוסף");
});
