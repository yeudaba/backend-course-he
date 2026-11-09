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
test("n", async (t) => {
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual((await topCustomers(db, 1)).map((c) => c.customerId), ["c1"]);
  assert.equal((await topCustomers(db, 10)).length, 3, "לקוח בלי הזמנות לא מופיע");
});
