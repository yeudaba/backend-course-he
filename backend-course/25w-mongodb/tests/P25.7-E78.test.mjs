import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E78.ts", ["ordersByStatus"])).ordersByStatus;

test("ספירה ואחוזים", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db), [
    { status: "delivered", count: 5, percent: 50 }, { status: "paid", count: 2, percent: 20 },
    { status: "pending", count: 2, percent: 20 }, { status: "cancelled", count: 1, percent: 10 },
  ]);
  await db.collection("orders").insertOne({ _id: "x", status: "refunded" });
  const r = await f(db);
  assert.deepEqual(r.map((x) => x.percent), [45.5, 18.2, 18.2, 9.1, 9.1]);
  assert.deepEqual(r.slice(3).map((x) => x.status), ["cancelled", "refunded"]);
  await db.collection("orders").deleteMany({});
  assert.deepEqual(await f(db), []);
});
