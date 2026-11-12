import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E48.ts", ["syncSoldOutTags"])).syncSoldOutTags;

test("תגיות ומספרים", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  const products = db.collection("products");
  await products.updateOne({ _id: "p1" }, { $push: { tags: "sold-out" } });
  await products.updateOne({ _id: "p7" }, { $push: { tags: "sold-out" } });
  assert.deepEqual(await f(db), { tagged: 1, untagged: 1 }, "p2 מקבל; p1 מאבד; p7 כבר יש");
  const tags = Object.fromEntries((await products.find().toArray()).map((p) => [p._id, p.tags]));
  assert.deepEqual(tags.p2, ["medium", "single-origin", "sold-out"]);
  assert.deepEqual(tags.p7, ["pour-over", "kettle", "sold-out"]);
  assert.deepEqual(tags.p1, ["light", "single-origin"]);
  assert.deepEqual(await f(db), { tagged: 0, untagged: 0 });
  await products.updateOne({ _id: "p2" }, { $set: { stock: 5 } });
  await products.updateOne({ _id: "p5" }, { $set: { stock: 0 } });
  assert.deepEqual(await f(db), { tagged: 1, untagged: 1 });
});
