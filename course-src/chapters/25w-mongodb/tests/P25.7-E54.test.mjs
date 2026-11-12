import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E54.ts", ["patchProduct"])).patchProduct;

test("עדכון חלקי", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, "p5", { price: 95 }), { id: "p5", name: "V60 Dripper", price: 95, tags: ["pour-over"] });
  assert.deepEqual(await f(db, "p5", { name: "  V60 02 ", tags: ["pour-over", "ceramic"] }), { id: "p5", name: "V60 02", price: 95, tags: ["pour-over", "ceramic"] });
  const doc = await db.collection("products").findOne({ _id: "p5" });
  assert.equal(doc.stock, 12, "שאר השדות נשארו");
  assert.equal(doc.reviews.length, 1);
  assert.equal(await f(db, "p99", { price: 1 }), null);
});
test("לא תקין — בלי לגעת", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  for (const b of [{}, { stock: 0 }, { price: 0 }, { price: "5" }, { name: " " }, { tags: "x" }, { $set: { stock: 0 } }, null]) {
    await assert.rejects(f(db, "p1", b), { message: "VALIDATION_ERROR" }, JSON.stringify(b));
  }
  assert.equal((await db.collection("products").findOne({ _id: "p1" })).price, 62);
});
