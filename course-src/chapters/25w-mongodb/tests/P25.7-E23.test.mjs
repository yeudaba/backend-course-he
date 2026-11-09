import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { cancelOrder } = await load(import.meta.url, "P25.7-E23.ts");
const stock = async (db, id) => (await db.collection("products").findOne({ _id: id })).stock;
const status = async (db, id) => (await db.collection("orders").findOne({ _id: id })).status;

test("ביטול: מחזיר את הכמויות למלאי", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  assert.equal(await cancelOrder(client, db, "o6"), true);
  assert.equal(await status(db, "o6"), "cancelled");
  assert.equal(await stock(db, "p3"), 122);
  assert.equal(await stock(db, "p4"), 16);
});
test("נמסרה / כבר בוטלה / לא קיימת ← false", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  for (const id of ["o1", "o5", "nope"]) assert.equal(await cancelOrder(client, db, id), false, id);
  assert.equal(await stock(db, "p7"), 0);
});
test("שני ביטולים במקביל — המלאי חוזר פעם אחת", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  const r = await Promise.all([cancelOrder(client, db, "o3"), cancelOrder(client, db, "o3")]);
  assert.deepEqual(r.sort(), [false, true]);
  assert.equal(await stock(db, "p6"), 6);
});
test("כישלון באמצע ← הכול מתבטל", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  // מלאי מקסימלי 100: p3 (120) לא יכול לעלות — העדכון השני ייכשל
  await db.command({ collMod: "products", validator: { $jsonSchema: { properties: { stock: { maximum: 100 } } } } });
  await db.collection("orders").insertOne({ _id: "o99", customerId: "c4", status: "paid", createdAt: new Date(), items: [{ productId: "p1", name: "x", price: 1, qty: 2 }, { productId: "p3", name: "y", price: 1, qty: 5 }], total: 7 });
  await assert.rejects(cancelOrder(client, db, "o99"));
  assert.equal(await stock(db, "p1"), 40, "ההחזרה של p1 חלק מהטרנזקציה — והתבטלה");
  assert.equal(await status(db, "o99"), "paid");
});
