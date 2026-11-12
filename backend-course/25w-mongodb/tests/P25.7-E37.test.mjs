import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E37.ts", ["lastOrders"])).lastOrders;

test("מהחדשה, עם limit", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await f(db, "c1", 2), [
    { id: "o10", status: "delivered", total: 100, createdAt: "2026-11-03T13:00:00.000Z" },
    { id: "o7", status: "pending", total: 140, createdAt: "2026-10-25T11:30:00.000Z" },
  ]);
  assert.deepEqual((await f(db, "c1", 10)).map((o) => o.id), ["o10", "o7", "o3", "o1"]);
  assert.deepEqual(await f(db, "c4", 5), []);
  assert.deepEqual(Object.keys((await f(db, "c2", 1))[0]).sort(), ["createdAt", "id", "status", "total"]);
});
