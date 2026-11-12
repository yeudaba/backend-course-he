import { test } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E36.ts", ["addProduct"])).addProduct;

test("תקין — עם ברירות מחדל ו־trim", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  const { id } = await f(db, { name: "  Aeropress  ", category: "gear", price: 129 });
  assert.match(id, /^[0-9a-f]{24}$/);
  const doc = await db.collection("products").findOne({ _id: new ObjectId(id) });
  assert.equal(doc.name, "Aeropress");
  assert.equal(doc.stock, 0);
  assert.deepEqual(doc.tags, []);
  assert.ok(doc.createdAt instanceof Date);
  assert.ok(Math.abs(doc.createdAt.getTime() - Date.now()) < 60_000);
  const { id: id2 } = await f(db, { name: "Mug", category: "merch", price: 35, stock: 3, tags: ["mug"] });
  assert.deepEqual((await db.collection("products").findOne({ _id: new ObjectId(id2) }, { projection: { _id: 0, createdAt: 0 } })), { name: "Mug", category: "merch", price: 35, stock: 3, tags: ["mug"] });
});
test("לא תקין — שום דבר לא נכתב", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  const bad = [
    {}, { name: " ", category: "gear", price: 1 }, { name: "x", category: "tea", price: 1 }, { name: "x", category: "gear", price: 0 },
    { name: "x", category: "gear", price: 9.5 }, { name: "x", category: "gear", price: "5" }, { name: "x", category: "gear", price: 5, stock: -1 },
    { name: "x", category: "gear", price: 5, role: "admin" }, { name: "x", category: "gear", price: 5, tags: [1] }, null, "x",
  ];
  for (const b of bad) await assert.rejects(f(db, b), { message: "VALIDATION_ERROR" }, JSON.stringify(b));
  assert.equal(await db.collection("products").countDocuments(), 0);
});
