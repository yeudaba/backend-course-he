import { test } from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E80.ts";
async function setup(t) {
  const mod = await exportsOf(import.meta.url, FILE, ["productInput", "createProduct"]);
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  return { ...mod, create: (input) => mod.createProduct(client, input), sent, db };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("יצירה", async (t) => {
  const { create, db, sent } = await setup(t);
  const p = await create({ name: "  Milk Frother ", category: "accessories", price: 59.9 });
  assert.deepEqual(p, { id: 15, name: "Milk Frother", category: "accessories", price: 59.9, stock: 0, isActive: true });
  const [row] = await db.rows("SELECT name, stock, added_on = CURRENT_DATE AS today FROM products WHERE id = 15");
  assert.deepEqual(row, { name: "Milk Frother", stock: 0, today: true }, "נשמר אחרי trim, stock 0, added_on היום");
  const q = await create({ name: "Big Kettle", category: "brewing", price: 1000, stock: 4 });
  assert.deepEqual(q, { id: 16, name: "Big Kettle", category: "brewing", price: 1000, stock: 4, isActive: true });
  assert.equal(sent.length, 2, "שאילתה אחת לכל יצירה");
  assert.ok(sent.every((s) => /\$1/.test(s.text) && !s.text.includes("Milk")), "ערכים כפרמטרים");
});
test("קלט לא תקין — ZodError, בלי מסד", async (t) => {
  const { create, sent, db } = await setup(t);
  for (const input of [
    { name: "x", category: "beans", price: 10 },
    { name: "Tea", category: "tea", price: 10 },
    { name: "Beans", category: "beans", price: 0 },
    { name: "Beans", category: "beans", price: 10.555 },
    { name: "Beans", category: "beans", price: 100001 },
    { name: "Beans", category: "beans", price: "10" },
    { name: "Beans", category: "beans", price: 10, stock: -1 },
    { name: "Beans", category: "beans", price: 10, stock: 1.5 },
    null,
  ]) {
    await assert.rejects(create(input), (e) => e instanceof z.ZodError, JSON.stringify(input));
  }
  assert.equal(sent.length, 0, "לא נשלחה אף שאילתה");
  assert.equal((await db.rows("SELECT COUNT(*)::int AS n FROM products"))[0].n, 14);
});
test("productInput לבד", async (t) => {
  const { productInput } = await setup(t);
  assert.deepEqual(productInput.parse({ name: " Ab ", category: "grinders", price: 0.01 }), { name: "Ab", category: "grinders", price: 0.01, stock: 0 });
});
