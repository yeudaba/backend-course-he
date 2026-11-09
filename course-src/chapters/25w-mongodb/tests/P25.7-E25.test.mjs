import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { mongoSandbox } from "../../tools/mongo.mjs";

import { sandbox } from "../../tools/sql.mjs";
const { migrateOrders } = await load(import.meta.url, "P25.7-E25.ts");

async function setup(t) {
  const pg = await sandbox(t, import.meta.url, "pg-orders.sql");
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  return { pool: pg.pool(2), db };
}
test("הזמנה + שורות ← מסמך אחד", async (t) => {
  const { pool, db } = await setup(t);
  assert.deepEqual(await migrateOrders(pool, db), { migrated: 3 });
  const o = await db.collection("orders").findOne({ _id: "o101" });
  assert.deepEqual(o, {
    _id: "o101",
    customerId: "c1",
    status: "delivered",
    createdAt: new Date("2026-09-15T07:00:00Z"),
    items: [{ productId: "p1", name: "Ethiopia Yirgacheffe", price: 60.5, qty: 2 }, { productId: "p8", name: "Ceramic Mug", price: 35, qty: 1 }],
    total: 156,
  });
  assert.deepEqual((await db.collection("orders").findOne({ _id: "o103" })).items.map((i) => i.productId), ["p8", "p1", "p3"], "לפי סדר השורות");
});
test("אפשר להריץ שוב — בלי כפילויות, ועם עדכונים", async (t) => {
  const { pool, db } = await setup(t);
  await migrateOrders(pool, db);
  await pool.query("UPDATE orders SET status = 'delivered' WHERE id = 102");
  assert.deepEqual(await migrateOrders(pool, db), { migrated: 3 });
  assert.equal(await db.collection("orders").countDocuments(), 3);
  assert.equal((await db.collection("orders").findOne({ _id: "o102" })).status, "delivered");
});
test("סכומים: price כמספר, total בלי שגיאות עיגול", async (t) => {
  const { pool, db } = await setup(t);
  await migrateOrders(pool, db);
  const totals = (await db.collection("orders").find().sort({ _id: 1 }).toArray()).map((o) => o.total);
  assert.deepEqual(totals, [156, 144, 180]);
});
