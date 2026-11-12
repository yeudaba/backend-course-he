import { test } from "node:test";
import assert from "node:assert/strict";
import { mongoSandbox } from "../../tools/mongo.mjs";
import { exportsOf, code } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P25.7-E100.ts", ["ensureCartTtl", "touchCart"]);

test("TTL ו־touch", async (t) => {
  const { ensureCartTtl, touchCart } = await get();
  const { db } = await mongoSandbox(t, import.meta.url, { seed: false });
  await ensureCartTtl(db);
  const idx = (await db.collection("carts").indexes()).find((i) => i.key.expiresAt === 1);
  assert.equal(idx?.expireAfterSeconds, 0);
  const t1 = new Date("2026-11-07T12:00:00Z");
  const e1 = await touchCart(db, "c1", t1);
  assert.equal(e1.toISOString(), "2026-11-14T12:00:00.000Z");
  await db.collection("carts").updateOne({ _id: "c1" }, { $push: { items: { productId: "p1", qty: 1 } } });
  const t2 = new Date("2026-11-10T08:00:00Z");
  await touchCart(db, "c1", t2);
  const cart = await db.collection("carts").findOne({ _id: "c1" });
  assert.deepEqual(cart.items, [{ productId: "p1", qty: 1 }], "items נשמרו");
  assert.equal(cart.updatedAt.toISOString(), t2.toISOString());
  assert.ok(cart.expiresAt instanceof Date);
  assert.equal(cart.expiresAt.toISOString(), "2026-11-17T08:00:00.000Z");
  await touchCart(db, "c2", t2);
  assert.deepEqual((await db.collection("carts").findOne({ _id: "c2" })).items, []);
  assert.doesNotMatch(code(import.meta.url, "P25.7-E100.ts"), /new Date\(\s*\)|Date\.now\(/, "now מוזרק");
});
