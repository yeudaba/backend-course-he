import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

const { topCustomers } = await load(import.meta.url, "P25.7-E15.ts");

test("שלושת הלקוחות המובילים — בלי הזמנות שבוטלו", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await topCustomers(db), [
    { customerId: "c1", name: "Dana Levi", spent: 702, orders: 4 },
    { customerId: "c3", name: "Maya Katz", spent: 422, orders: 3 },
    { customerId: "c2", name: "Yossi Cohen", spent: 254, orders: 2 },
  ]);
});
test("שוויון ב־spent ← לפי customerId", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  // c2 מגיע ל־422 — כמו c3
  await db.collection("orders").insertOne({ _id: "o99", customerId: "c2", status: "paid", createdAt: new Date("2026-11-04T10:00:00Z"), items: [], total: 168 });
  assert.deepEqual((await topCustomers(db)).map((c) => [c.customerId, c.spent]), [["c1", 702], ["c2", 422], ["c3", 422]], "תיקו — c2 לפני c3 ($sort: { spent: -1, _id: 1 })");
});
test("n", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual((await topCustomers(db, 1)).map((c) => c.customerId), ["c1"]);
  assert.equal((await topCustomers(db, 10)).length, 3, "לקוח בלי הזמנות לא מופיע");
});
