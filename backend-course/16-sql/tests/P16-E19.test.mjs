import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("עמודת sku", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P16-E19.sql");
  const rows = await db.rows("SELECT id, sku FROM products ORDER BY id");
  assert.equal(rows.length, 14);
  assert.equal(rows[0].sku, "BEANS-1");
  assert.equal(rows[4].sku, "GRINDERS-5");
  assert.equal(rows[13].sku, "ACCESSORIES-14");
  const [col] = await db.rows("SELECT is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'products' AND column_name = 'sku'");
  assert.equal(col?.is_nullable, "NO", "sku צריך להיות NOT NULL");
  await assert.rejects(db.query("UPDATE products SET sku = 'BEANS-1' WHERE id = 2"), undefined, "sku צריך להיות UNIQUE");
});
