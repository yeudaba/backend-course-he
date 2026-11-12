import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E62.ts", ["extractReviews"])).extractReviews;

test("העברה מלאה, והרצה חוזרת", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db), { moved: 9 });
  assert.equal(await db.collection("reviews").countDocuments(), 9);
  assert.deepEqual(await db.collection("reviews").findOne({ productId: "p3", by: "c2" }, { projection: { _id: 0 } }), { productId: "p3", by: "c2", rating: 5 });
  assert.equal(await db.collection("products").countDocuments({ reviews: { $exists: true } }), 0);
  assert.equal((await db.collection("products").findOne({ _id: "p3" })).ratingSum, 14, "התקציר נשאר");
  assert.deepEqual(await f(db), { moved: 0 });
  const idx = (await db.collection("reviews").indexes()).find((i) => i.unique);
  assert.deepEqual(idx?.key, { productId: 1, by: 1 });
});
test("המשך אחרי הפסקה — בלי כפילויות", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await db.collection("reviews").insertOne({ productId: "p1", by: "c1", rating: 5 });
  await db.collection("reviews").createIndex({ productId: 1, by: 1 }, { unique: true });
  assert.deepEqual(await f(db), { moved: 8 }, "ביקורת אחת כבר הועברה בהרצה קודמת");
  assert.equal(await db.collection("reviews").countDocuments(), 9);
});
