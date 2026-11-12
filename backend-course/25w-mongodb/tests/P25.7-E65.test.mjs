import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E65.ts", ["ordersWithCustomer"])).ordersWithCustomer;

test("עם שם, ובלי לקוח", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, "paid"), [{ orderId: "o6", customerName: "Maya Katz", total: 146 }, { orderId: "o3", customerName: "Dana Levi", total: 249 }]);
  await db.collection("customers").deleteOne({ _id: "c2" });
  assert.deepEqual(await f(db, "delivered"), [
    { orderId: "o10", customerName: "Dana Levi", total: 100 },
    { orderId: "o8", customerName: null, total: 110 },
    { orderId: "o4", customerName: "Maya Katz", total: 132 },
    { orderId: "o2", customerName: null, total: 144 },
    { orderId: "o1", customerName: "Dana Levi", total: 213 },
  ]);
  assert.deepEqual(await f(db, "nope"), []);
});
