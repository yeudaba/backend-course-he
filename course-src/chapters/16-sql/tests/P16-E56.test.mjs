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
  // כל קריאה עם הקלט שלה בהודעה
  const ids = async (opts) => (await search(opts)).map((p) => p.id);
  assert.deepEqual(await search({ q: "grinder" }), [
    { id: 6, name: "Electric Grinder Pro", price: 649 },
    { id: 14, name: "Grinder Cleaning Brush", price: 19.9 },
    { id: 5, name: "Hand Grinder", price: 189 },
  ]);
  assert.deepEqual(await ids({ category: "beans" }), [3, 2, 1], 'searchProducts(client, { category: "beans" }) — פעילים בלבד (Espresso Blend לא פעיל), לפי שם');
  assert.deepEqual(await ids({ q: "BEANS", category: "beans", limit: 2 }), [3, 2], 'searchProducts(client, { q: "BEANS", category: "beans", limit: 2 })');
  assert.equal((await search({})).length, 10, "searchProducts(client, {}) — ברירת מחדל limit = 10, כמה מוצרים חזרו");
  assert.equal((await search({ q: "  " })).length, 10, 'searchProducts(client, { q: "  " }) — q של רווחים בלבד הוא ריק אחרי trim, ולכן בלי תנאי על name. כמה מוצרים חזרו');
  assert.deepEqual(await ids({ q: " mug " }), [11], 'searchProducts(client, { q: " mug " }) — מחפשים "mug" (אחרי trim)');
  assert.deepEqual(await search({ category: "tea" }), [], 'searchProducts(client, { category: "tea" })');
});
test("תווים מיוחדים ופרמטרים", async (t) => {
  const { search, sent } = await setup(t);
  assert.deepEqual(await search({ q: "_" }), [], 'searchProducts(client, { q: "_" }) — _ הוא תו רגיל (escape)');
  assert.deepEqual(await search({ q: "%" }), [], 'searchProducts(client, { q: "%" }) — % הוא תו רגיל (escape)');
  assert.deepEqual((await search({ q: "(100)" })).map((p) => p.id), [10], 'searchProducts(client, { q: "(100)" })');
  assert.deepEqual(await search({ q: "x' OR 'a'='a" }), [], `searchProducts(client, { q: "x' OR 'a'='a" }) — injection לא עובד`);
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
