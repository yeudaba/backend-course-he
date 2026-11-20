import { test } from "node:test";
import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E101.ts", ["toApiOrder"])).toApiOrder;
const doc = () => ({
  _id: new ObjectId("6af1a8c0e4b0f1a2b3c4d5e6"),
  customerId: "c1",
  status: "pending",
  createdAt: new Date("2026-11-03T13:00:00Z"),
  items: [{ productId: "p8", name: "Ceramic Mug", price: 35, qty: 4 }, { productId: "p4", name: "Decaf Brazil", price: 50, qty: 1 }],
});

test("הצורה של ה־API", async () => {
  const f = await get();
  assert.deepEqual(f(doc()), {
    id: "6af1a8c0e4b0f1a2b3c4d5e6",
    customerId: "c1",
    status: "pending",
    createdAt: "2026-11-03T13:00:00.000Z",
    items: [{ productId: "p8", name: "Ceramic Mug", price: 35, qty: 4 }, { productId: "p4", name: "Decaf Brazil", price: 50, qty: 1 }],
    total: 190,
  });
  assert.equal(f({ ...doc(), _id: "o7" }).id, "o7");
});
test("המסמך לא משתנה, וקריאה שנייה נותנת אותה תוצאה", async () => {
  const f = await get();
  const d = doc();
  const first = f(d);
  assert.ok(d._id instanceof ObjectId, "_id נמחק מהמסמך המקורי");
  assert.ok(d.createdAt instanceof Date, "createdAt במסמך המקורי השתנה");
  assert.equal(Object.hasOwn(d, "total"), false, "נוסף total למסמך המקורי");
  assert.deepEqual(f(d), first, "קריאה שנייה עם אותו מסמך (מה־cache) נתנה תוצאה אחרת");
  first.items[0].qty = 99;
  assert.equal(d.items[0].qty, 4, "items בתשובה הוא אותו מערך כמו במסמך");
});
