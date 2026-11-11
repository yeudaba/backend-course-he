import { test } from "node:test";
import assert from "node:assert/strict";
import { sandbox } from "../../tools/sql.mjs";
import { exportsOf, typecheck } from "./_ts.mjs";

const FILE = "P16-E56.ts";
async function setup(t) {
  const { searchProducts } = await exportsOf(import.meta.url, FILE, ["searchProducts"]);
  const db = await sandbox(t, import.meta.url, "shop.sql");
  const sent = [];
  const client = { query: (text, values) => (sent.push({ text, values }), db.client.query(text, values)) };
  return { search: (opts) => searchProducts(client, opts), sent, db };
}
test("עובר בדיקת טיפוסים", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("חיפוש, קטגוריה, מיון ו־price כמספר", async (t) => {
  const { search } = await setup(t);
  assert.deepEqual(await search({ q: "grinder" }), [
    { id: 6, name: "Electric Grinder Pro", price: 649 },
    { id: 14, name: "Grinder Cleaning Brush", price: 19.9 },
    { id: 5, name: "Hand Grinder", price: 189 },
  ]);
  assert.deepEqual((await search({ category: "beans" })).map((p) => p.id), [3, 2, 1], "פעילים בלבד (Espresso Blend לא פעיל), לפי שם");
  assert.deepEqual((await search({ q: "BEANS", category: "beans", limit: 2 })).map((p) => p.id), [3, 2]);
  assert.equal((await search({})).length, 10, "ברירת מחדל limit = 10");
  assert.deepEqual((await search({ q: "  " })).length, 10, "q ריק — בלי תנאי");
  assert.deepEqual(await search({ category: "tea" }), []);
});
test("תווים מיוחדים ופרמטרים", async (t) => {
  const { search, sent } = await setup(t);
  assert.deepEqual(await search({ q: "_" }), [], "_ הוא תו רגיל (escape)");
  assert.deepEqual(await search({ q: "%" }), []);
  assert.deepEqual((await search({ q: "(100)" })).map((p) => p.id), [10]);
  assert.deepEqual(await search({ q: "x' OR 'a'='a" }), [], "injection לא עובד");
  for (const s of sent) {
    assert.ok(!s.text.includes("x' OR"), "ערך מהמשתמש לא בתוך הטקסט");
    assert.match(s.text, /\$\d/, "פרמטרים $1, $2...");
    assert.ok(!/LIMIT\s+\d/.test(s.text), "גם limit כפרמטר");
  }
});
test("limit לא תקין — בלי לפנות למסד", async (t) => {
  const { search, sent } = await setup(t);
  for (const limit of [0, 51, 2.5, -1]) await assert.rejects(search({ limit }), { message: "limit חייב להיות 1–50" });
  assert.equal(sent.length, 0);
});
