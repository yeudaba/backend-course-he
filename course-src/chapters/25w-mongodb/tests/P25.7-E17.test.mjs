import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

import { ObjectId } from "mongodb";
const { placeOrder, OutOfStockError } = await load(import.meta.url, "P25.7-E17.ts");
const stock = async (db, id) => (await db.collection("products").findOne({ _id: id })).stock;

test("הזמנה: מוריד מלאי, ושומר מחיר ושם מהמסד", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  const order = await placeOrder(client, db, "c4", [{ productId: "p1", qty: 2 }, { productId: "p8", qty: 1, price: 0.01 }]);
  assert.ok(order._id instanceof ObjectId);
  assert.equal(order.total, 159, "62×2 + 35 — המחיר שהלקוח שלח לא משנה");
  assert.deepEqual(order.items, [{ productId: "p1", name: "Ethiopia Yirgacheffe", price: 62, qty: 2 }, { productId: "p8", name: "Ceramic Mug", price: 35, qty: 1 }]);
  assert.equal(await stock(db, "p1"), 38);
  assert.equal(await stock(db, "p8"), 59);
  const saved = await db.collection("orders").findOne({ _id: order._id });
  assert.equal(saved.status, "pending");
  assert.equal(saved.customerId, "c4");
});
test("מוצר אחד חסר ← OutOfStockError, ושום דבר לא השתנה", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  await assert.rejects(placeOrder(client, db, "c4", [{ productId: "p1", qty: 2 }, { productId: "p7", qty: 1 }]), OutOfStockError);
  assert.equal(await stock(db, "p1"), 40, "ההורדה של p1 בוטלה");
  assert.equal(await db.collection("orders").countDocuments(), 10);
});
test("שתי הזמנות במקביל על 5 יחידות, 3 בכל אחת — רק אחת עוברת", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  const r = await Promise.allSettled([placeOrder(client, db, "c1", [{ productId: "p6", qty: 3 }]), placeOrder(client, db, "c2", [{ productId: "p6", qty: 3 }])]);
  assert.equal(r.filter((x) => x.status === "fulfilled").length, 1);
  assert.ok(r.find((x) => x.status === "rejected").reason instanceof OutOfStockError);
  assert.equal(await stock(db, "p6"), 2);
});
test("עגלה ריקה ← RangeError", async (t) => {
  const { client, db } = await mongoSandbox(t, import.meta.url);
  await assert.rejects(placeOrder(client, db, "c1", []), RangeError);
});
