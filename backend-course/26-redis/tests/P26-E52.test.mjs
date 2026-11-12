import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { findProduct } = await load(import.meta.url, "P26-E52.ts");

function fakeDb(rows) {
  const db = { calls: 0, load: async (id) => { db.calls++; return rows[id] ?? null; } };
  return db;
}

test("מוצר קיים — נשמר עם ttl, ו־HIT בלי מסד", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const db = fakeDb({ 3: { id: 3, name: "V60" } });
  assert.deepEqual(await findProduct(redis, 3, db.load), { id: 3, name: "V60" });
  assert.deepEqual(await findProduct(redis, 3, db.load), { id: 3, name: "V60" });
  assert.equal(db.calls, 1);
  const ttl = await raw.ttl(`${prefix}product:3`);
  assert.ok(ttl > 295 && ttl <= 300, `ttl ${ttl}`);
});
test("מוצר שלא קיים — __none__ עם missTtl, ובקשות חוזרות לא מגיעות למסד", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const db = fakeDb({});
  for (let i = 0; i < 20; i++) assert.equal(await findProduct(redis, 999, db.load), null);
  assert.equal(db.calls, 1, `המסד נקרא ${db.calls} פעמים`);
  assert.equal(await raw.get(`${prefix}product:999`), "__none__");
  const ttl = await raw.ttl(`${prefix}product:999`);
  assert.ok(ttl > 25 && ttl <= 30, `ttl ${ttl}`);
});
test("opts: ttl ו־missTtl", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const db = fakeDb({ 1: { id: 1 } });
  await findProduct(redis, 1, db.load, { ttl: 60 });
  await findProduct(redis, 2, db.load, { missTtl: 5 });
  assert.ok((await raw.ttl(`${prefix}product:1`)) <= 60);
  assert.ok((await raw.ttl(`${prefix}product:1`)) > 55);
  assert.ok((await raw.ttl(`${prefix}product:2`)) <= 5);
});
