import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E61.ts", ["recomputeRatings"])).recomputeRatings;

test("מתקן רק את מה שזז", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  const products = db.collection("products");
  assert.deepEqual(await f(db), [], "הנתונים תקינים");
  await products.updateOne({ _id: "p3" }, { $set: { ratingSum: 99 } });
  await products.updateOne({ _id: "p1" }, { $push: { reviews: { by: "c4", rating: 1 } } });
  await products.updateOne({ _id: "p6" }, { $unset: { reviews: "" } });
  await products.insertOne({ _id: "p9", name: "New" });
  assert.deepEqual(await f(db), ["p1", "p3", "p6", "p9"]);
  const byId = Object.fromEntries((await products.find().toArray()).map((p) => [p._id, [p.ratingCount, p.ratingSum]]));
  assert.deepEqual(byId.p1, [3, 10]);
  assert.deepEqual(byId.p3, [3, 14]);
  assert.deepEqual(byId.p6, [0, 0]);
  assert.deepEqual(byId.p9, [0, 0]);
  assert.deepEqual(await f(db), []);
});
