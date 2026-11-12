import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E35.ts", ["customersInCity"])).customersInCity;

test("לקוחות בעיר", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await db.collection("customers").insertOne({ _id: "c9", name: "Adi Bar", email: "adi@example.com", city: "Haifa", createdAt: new Date() });
  assert.deepEqual(await f(db, "Haifa"), [
    { name: "Adi Bar", email: "adi@example.com" },
    { name: "Dana Levi", email: "dana@example.com" },
    { name: "Maya Katz", email: "maya@example.com" },
  ]);
  assert.deepEqual(await f(db, "Jerusalem"), [{ name: "Avi Mizrahi", email: "avi@example.com" }]);
  assert.deepEqual(await f(db, "haifa"), [], "בלי תלות ברישיות — לא");
});
