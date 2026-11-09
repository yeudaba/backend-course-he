import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { findProducts } = await load(import.meta.url, "P25.7-E06.ts");
const ids = (rows) => rows.map((r) => r._id);

test("סינון לפי קטגוריה, ממוין לפי מחיר", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(ids(await findProducts(db, { category: "beans" })), ["p3", "p4", "p2", "p1"]);
});
test("maxPrice כולל את הגבול", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(ids(await findProducts(db, { maxPrice: 50 })), ["p8", "p3", "p4"]);
});
test("inStock ו־tag", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(ids(await findProducts(db, { inStock: true, category: "gear" })), ["p5", "p6"], "p7 אזל");
  assert.deepEqual(ids(await findProducts(db, { tag: "pour-over" })), ["p5", "p7"]);
  assert.deepEqual(ids(await findProducts(db, { inStock: false, category: "gear" })), ["p5", "p7", "p6"], "inStock: false — בלי סינון");
});
test("בלי פילטרים — הכול; רק _id, name, price", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const all = await findProducts(db);
  assert.equal(all.length, 8);
  assert.deepEqual(all[0], { _id: "p8", name: "Ceramic Mug", price: 35 });
});
