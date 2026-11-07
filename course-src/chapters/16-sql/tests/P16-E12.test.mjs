import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("AeroPress נוסף", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const returned = await db.fileRows("P16-E12.sql");
  assert.deepEqual(returned, [{ id: 15, name: "AeroPress" }], "RETURNING id, name");
  const [row] = await db.rows("SELECT name, category, price, stock, is_active, added_on FROM products WHERE id = 15");
  assert.deepEqual(row, { name: "AeroPress", category: "brewing", price: 139, stock: 20, is_active: true, added_on: "2026-11-01" });
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM products"))[0].n, 15);
});
