import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";

test("מלאי ומחירים", async (t) => {
  const db = await sandbox(t, import.meta.url, "shop.sql");
  await db.runFile("P16-E17.sql");
  const rows = await db.rows("SELECT name, price, is_active FROM products ORDER BY id");
  const by = Object.fromEntries(rows.map((r) => [r.name, r]));
  assert.deepEqual(by["Ethiopia Beans 1kg"], { name: "Ethiopia Beans 1kg", price: 94.4, is_active: true });
  assert.deepEqual(by["Brazil Beans 250g"], { name: "Brazil Beans 250g", price: 31.4, is_active: true });
  assert.deepEqual(by["Colombia Beans 1kg"], { name: "Colombia Beans 1kg", price: 84.9, is_active: false }, "אזל ← לא פעיל, ולא התייקר");
  assert.deepEqual(by["Espresso Blend 1kg"], { name: "Espresso Blend 1kg", price: 79, is_active: false }, "לא פעיל — לא מתייקר");
  assert.equal(by["V60 Ceramic"].is_active, false);
  assert.equal(by["V60 Ceramic"].price, 99, "רק beans מתייקרים");
  assert.equal(by["Hand Grinder"].price, 189);
  assert.equal(rows.filter((r) => !r.is_active).length, 4);
});
