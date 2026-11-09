import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { customerOrders } = await load(import.meta.url, "P25.7-E11.ts");

test("ההזמנות של לקוח, מהחדשה לישנה", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const rows = await customerOrders(db, "c1");
  assert.deepEqual(rows.map((r) => r._id), ["o10", "o7", "o3", "o1"]);
});
test("בלי items ובלי customerId; עם status, total ו־createdAt", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  const [first] = await customerOrders(db, "c1");
  assert.deepEqual(Object.keys(first).sort(), ["_id", "createdAt", "status", "total"]);
  assert.equal(first.total, 100);
});
test("סינון לפי כמה סטטוסים", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual((await customerOrders(db, "c1", { status: ["delivered"] })).map((r) => r._id), ["o10", "o1"]);
  assert.deepEqual((await customerOrders(db, "c3", { status: ["paid", "pending"] })).map((r) => r._id), ["o9", "o6"]);
  assert.deepEqual(await customerOrders(db, "c4"), []);
});
