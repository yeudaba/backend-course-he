import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E94.ts", ["applyPriceList"])).applyPriceList;

test("מחירון", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, [{ productId: "p1", price: 64 }, { productId: "p5", price: 89 }, { productId: "p99", price: 10 }, { productId: "p42", price: 1 }]), { matched: 2, modified: 1, missing: ["p42", "p99"] });
  assert.equal((await db.collection("products").findOne({ _id: "p1" })).price, 64);
  assert.deepEqual(await f(db, []), { matched: 0, modified: 0, missing: [] });
});
test("פקודה אחת, ומחיר לא תקין לפני הכול", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await assert.rejects(f(db, [{ productId: "p1", price: 70 }, { productId: "p2", price: 0 }]), RangeError);
  assert.equal((await db.collection("products").findOne({ _id: "p1" })).price, 62, "שום דבר לא נכתב");
  let bulk = 0;
  let updates = 0;
  const col = db.collection("products");
  const spy = { collection: () => new Proxy(col, { get: (o, k) => (k === "bulkWrite" ? (...a) => { bulk++; return o.bulkWrite(...a); } : k === "updateOne" || k === "updateMany" ? (...a) => { updates++; return o[k](...a); } : typeof o[k] === "function" ? o[k].bind(o) : o[k]) }) };
  await f(spy, Array.from({ length: 8 }, (_, i) => ({ productId: `p${i + 1}`, price: 100 + i })));
  assert.deepEqual([bulk, updates], [1, 0]);
});
