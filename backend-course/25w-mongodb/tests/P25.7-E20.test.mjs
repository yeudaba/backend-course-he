import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { searchProducts } = await load(import.meta.url, "P25.7-E20.ts");
const names = (r) => r.map((p) => p.name);

test("חיפוש רגיל: לפי חלק מהשם, בלי רגישות לרישיות", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(names(await searchProducts(db, { q: "MUG" })), ["Ceramic Mug"]);
  assert.deepEqual(names(await searchProducts(db, { q: "e", category: "gear" })), ["Gooseneck Kettle", "Hand Grinder", "V60 Dripper"]);
});
test("אובייקט במקום מחרוזת (NoSQL injection) ← RangeError", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await assert.rejects(searchProducts(db, { category: { $ne: "merch" } }), RangeError);
  await assert.rejects(searchProducts(db, { q: { $regex: ".*" } }), RangeError);
});
test("תווים מיוחדים הם טקסט", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await searchProducts(db, { q: "." }), [], "נקודה — רק שמות עם נקודה");
  assert.deepEqual(await searchProducts(db, { q: "(" }), [], "סוגר לא שובר את השאילתה");
  await db.collection("products").insertOne({ _id: "p9", name: "Filter Papers (100)", category: "gear", price: 15, stock: 50 });
  assert.deepEqual(names(await searchProducts(db, { q: "(100)" })), ["Filter Papers (100)"]);
});
test("לכל היותר 20 תוצאות", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  await db.collection("products").insertMany(Array.from({ length: 30 }, (_, i) => ({ _id: `x${i}`, name: `Extra ${i}`, category: "merch", price: 10, stock: 1 })));
  assert.equal((await searchProducts(db, {})).length, 20);
});
