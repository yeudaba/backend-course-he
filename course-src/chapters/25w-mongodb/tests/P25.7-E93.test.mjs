import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E93.ts", ["moveStock"])).moveStock;
async function setup(t) {
  const sb = await mongoSandbox(t, import.meta.url, { seed: false });
  await sb.db.collection("warehouses").insertMany([{ _id: "tlv", stock: { p1: 10, p2: 1 } }, { _id: "hfa", stock: { p1: 2 } }]);
  return sb;
}
const stock = async (db) => Object.fromEntries((await db.collection("warehouses").find().sort({ _id: 1 }).toArray()).map((w) => [w._id, w.stock]));

test("העברה", async (t) => {
  const f = await get();
  const { client, db } = await setup(t);
  await f(client, db, { from: "tlv", to: "hfa", productId: "p1", qty: 4 });
  await f(client, db, { from: "tlv", to: "hfa", productId: "p2", qty: 1 });
  assert.deepEqual(await stock(db), { hfa: { p1: 6, p2: 1 }, tlv: { p1: 6, p2: 0 } });
});
test("שגיאות — שום דבר לא זז", async (t) => {
  const f = await get();
  const { client, db } = await setup(t);
  await assert.rejects(f(client, db, { from: "tlv", to: "hfa", productId: "p1", qty: 11 }), { message: "INSUFFICIENT_STOCK" });
  await assert.rejects(f(client, db, { from: "hfa", to: "tlv", productId: "p9", qty: 1 }), { message: "INSUFFICIENT_STOCK" });
  await assert.rejects(f(client, db, { from: "tlv", to: "jlm", productId: "p1", qty: 3 }), { message: "NO_SUCH_WAREHOUSE" });
  for (const q of [0, -1, 1.5]) await assert.rejects(f(client, db, { from: "tlv", to: "hfa", productId: "p1", qty: q }), RangeError);
  assert.deepEqual(await stock(db), { hfa: { p1: 2 }, tlv: { p1: 10, p2: 1 } }, "ההורדה מ־tlv בוטלה");
});
test("במקביל — לא יורד מתחת לאפס", async (t) => {
  const f = await get();
  const { client, db } = await setup(t);
  const r = await Promise.allSettled(Array.from({ length: 6 }, () => f(client, db, { from: "tlv", to: "hfa", productId: "p1", qty: 3 })));
  assert.equal(r.filter((x) => x.status === "fulfilled").length, 3);
  assert.deepEqual(await stock(db), { hfa: { p1: 11 }, tlv: { p1: 1, p2: 1 } });
});
