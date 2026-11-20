import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { cachedProduct } = await load(import.meta.url, "P26-E122.ts");

function db(rows) {
  const calls = [];
  return { calls, rows, load: async (id) => (calls.push(id), rows[id] ?? null) };
}

test("MISS ואז HIT, עם TTL", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const d = db({ 1: { id: 1, name: "Mug", price: 35 } });
  assert.deepEqual(await cachedProduct(redis, 1, d.load, 90), { product: { id: 1, name: "Mug", price: 35 }, cache: "MISS" });
  assert.deepEqual(await cachedProduct(redis, 1, d.load, 90), { product: { id: 1, name: "Mug", price: 35 }, cache: "HIT" });
  assert.deepEqual(d.calls, [1], "ב־HIT לא פונים למסד");
  const ttl = await raw.ttl(`${prefix}product:1`);
  assert.ok(ttl > 80 && ttl <= 90, `TTL של product:1 הוא ${ttl} — בלי EX הערך נשאר לתמיד, ושינוי מחיר לא מגיע לאתר`);
});
test("מוצר שלא נמצא לא נשמר", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const d = db({});
  assert.deepEqual(await cachedProduct(redis, 7, d.load), { product: null, cache: "MISS" });
  assert.equal(await raw.exists(`${prefix}product:7`), 0, "null נשמר ב־cache");
  d.rows[7] = { id: 7, name: "New" };
  assert.deepEqual(await cachedProduct(redis, 7, d.load), { product: { id: 7, name: "New" }, cache: "MISS" }, "מוצר שנוסף אחרי חיפוש — צריך להימצא");
});
test("Redis כבוי או זורק ← OFF, מהמסד", async (t) => {
  const d = db({ 2: { id: 2, name: "Tea" } });
  assert.deepEqual(await cachedProduct(null, 2, d.load), { product: { id: 2, name: "Tea" }, cache: "OFF" });
  const broken = { get: async () => { throw new Error("connect ECONNREFUSED"); }, set: async () => { throw new Error("connect ECONNREFUSED"); } };
  assert.deepEqual(await cachedProduct(broken, 2, d.load), { product: { id: 2, name: "Tea" }, cache: "OFF" }, "Redis זרק — הבקשה צריכה להצליח מהמסד");
});
