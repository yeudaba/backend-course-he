import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.7-E79.ts", ["ensureShopIndexes", "usesIndex"]);
const keys = async (col) => (await col.indexes()).map((i) => JSON.stringify(i.key) + (i.unique ? "!" : "")).sort();

test("האינדקסים, פעמיים", async (t) => {
  const { ensureShopIndexes } = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  await ensureShopIndexes(db);
  await ensureShopIndexes(db);
  assert.deepEqual(await keys(db.collection("orders")), ['{"_id":1}', '{"customerId":1,"createdAt":-1}', '{"status":1,"createdAt":-1}']);
  assert.deepEqual(await keys(db.collection("products")), ['{"_id":1}', '{"category":1,"price":1}', '{"tags":1}']);
  assert.deepEqual(await keys(db.collection("customers")), ['{"_id":1}', '{"email":1}!']);
});
test("usesIndex — לפני ואחרי", async (t) => {
  const { ensureShopIndexes, usesIndex } = await get();
  const { db } = await mongoSandbox(t, import.meta.url);
  assert.deepEqual(await usesIndex(db, { customerId: "c1" }, { createdAt: -1 }), { ixscan: false, inMemorySort: true });
  await ensureShopIndexes(db);
  assert.deepEqual(await usesIndex(db, { customerId: "c1" }, { createdAt: -1 }), { ixscan: true, inMemorySort: false });
  assert.deepEqual(await usesIndex(db, { status: "paid" }, { createdAt: 1 }), { ixscan: true, inMemorySort: false });
  assert.equal((await usesIndex(db, { total: { $gt: 100 } }, { total: 1 })).ixscan, false);
});
