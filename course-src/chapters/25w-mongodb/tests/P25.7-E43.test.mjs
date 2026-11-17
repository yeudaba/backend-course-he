import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25.7-E43.ts", ["loadSeed"])).loadSeed;
const SEED = JSON.stringify({
  customers: [{ _id: "c1", name: "Dana", createdAt: "2026-09-01T08:00:00Z" }],
  orders: [
    { _id: "o1", customerId: "c1", createdAt: "2026-10-02T09:12:00Z", items: [{ productId: "p1", shippedAt: "2026-10-03T10:00:00Z", note: "At home" }], paidAt: null },
    { _id: "o2", customerId: "c1", createdAt: "2026-10-05T14:40:00.500Z", items: [] },
  ],
  logs: [],
});

test("טעינה עם תאריכים", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  assert.deepEqual(await f(db, SEED), { customers: 1, orders: 2, logs: 0 });
  const o1 = await db.collection("orders").findOne({ _id: "o1" });
  assert.ok(o1.createdAt instanceof Date);
  assert.equal(o1.createdAt.toISOString(), "2026-10-02T09:12:00.000Z");
  assert.ok(o1.items[0].shippedAt instanceof Date, "גם בעומק");
  assert.equal(o1.items[0].note, "At home", "רק שדות שנגמרים ב־At");
  assert.equal(o1.paidAt, null);
  assert.equal((await db.collection("orders").countDocuments({ createdAt: { $gte: new Date("2026-10-05T00:00:00Z") } })), 1);
});
test("שגיאות — בלי לכתוב", async (t) => {
  const f = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await assert.rejects(f(db, "{bad"), { message: "JSON לא תקין" });
  await assert.rejects(f(db, JSON.stringify({ a: [{ createdAt: "yesterday" }] })), /createdAt/);
  assert.deepEqual(await db.listCollections().toArray(), []);
});
