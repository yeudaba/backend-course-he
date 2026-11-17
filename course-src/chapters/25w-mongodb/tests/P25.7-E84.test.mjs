import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E84.ts", ["repeatCustomers"])).repeatCustomers;

test("לקוחות חוזרים", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, 3), [
    { customerId: "c1", name: "Dana Levi", orders: 4, spent: 702, lastOrderAt: "2026-11-03T13:00:00.000Z" },
    { customerId: "c3", name: "Maya Katz", orders: 3, spent: 422, lastOrderAt: "2026-11-01T22:10:00.000Z" },
  ]);
  assert.deepEqual((await f(db, 2)).map((r) => [r.customerId, r.orders]), [["c1", 4], ["c3", 3], ["c2", 2]], "o5 של c2 בוטלה");
  assert.deepEqual(await f(db, 5), []);
});
