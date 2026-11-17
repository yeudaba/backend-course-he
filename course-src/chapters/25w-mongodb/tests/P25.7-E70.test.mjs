import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E70.ts", ["createReview"])).createReview;
async function setup(t) {
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await db.createCollection("reviews", { validator: { $jsonSchema: { bsonType: "object", required: ["productId", "by", "rating"], properties: { rating: { bsonType: "int", minimum: 1, maximum: 5 } } } } });
  await db.collection("reviews").createIndex({ productId: 1, by: 1 }, { unique: true });
  return db;
}

test("נוצרת, ושגיאות ממופות", async (t) => {
  const f = await get();
  const db = await setup(t);
  const { id } = await f(db, { productId: "p1", by: "c1", rating: 5, text: "מעולה" });
  assert.match(id, /^[0-9a-f]{24}$/);
  const doc = await db.collection("reviews").findOne({ by: "c1" });
  assert.ok(doc.createdAt instanceof Date);
  assert.equal(doc.text, "מעולה");
  await assert.rejects(f(db, { productId: "p1", by: "c1", rating: 4 }), { message: "ALREADY_REVIEWED" });
  for (const r of [0, 6, 4.5]) await assert.rejects(f(db, { productId: "p1", by: `x${r}`, rating: r }), { message: "SCHEMA_VIOLATION" }, String(r));
  for (const b of [{}, { productId: "", by: "c", rating: 1 }, { productId: "p", by: "c", rating: "5" }, { productId: "p", by: "c", rating: 5, text: "x".repeat(501) }, { productId: "p", by: "c", rating: 5, admin: true }]) {
    await assert.rejects(f(db, b), { message: "VALIDATION_ERROR" }, JSON.stringify(b));
  }
  assert.equal(await db.collection("reviews").countDocuments(), 1);
});
