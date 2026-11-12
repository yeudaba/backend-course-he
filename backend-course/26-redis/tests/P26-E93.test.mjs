import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { getOrSet, invalidate } = await load(import.meta.url, "P26-E93.ts");

test("MISS, HIT, וביטול בגרסה", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  let n = 0;
  const loader = async () => ({ n: ++n });
  assert.deepEqual(await getOrSet(redis, "products", "q=V60", 60, loader), { value: { n: 1 }, status: "MISS" });
  assert.deepEqual(await getOrSet(redis, "products", "q=V60", 60, loader), { value: { n: 1 }, status: "HIT" });
  assert.equal(await raw.get(`${prefix}cache:products:0:q=V60`), '{"n":1}', "מפתח cache:<group>:<version>:<key>");
  const ttl = await raw.ttl(`${prefix}cache:products:0:q=V60`);
  assert.ok(ttl > 55 && ttl <= 60);
  await invalidate(redis, "products");
  assert.equal(await raw.get(`${prefix}v:products`), "1");
  assert.deepEqual(await getOrSet(redis, "products", "q=V60", 60, loader), { value: { n: 2 }, status: "MISS" });
  assert.equal(await raw.get(`${prefix}cache:products:1:q=V60`), '{"n":2}');
  assert.deepEqual(await getOrSet(redis, "other", "q=V60", 60, loader), { value: { n: 3 }, status: "MISS" }, "קבוצה אחרת — גרסה משלה");
});
test("null ← OFF; Redis זורק בקריאה ← OFF; בכתיבה ← MISS", async () => {
  let n = 0;
  const loader = async () => ++n;
  assert.deepEqual(await getOrSet(null, "g", "k", 60, loader), { value: 1, status: "OFF" });
  const down = { get: async () => { throw new Error("ECONNREFUSED"); }, set: async () => { throw new Error("ECONNREFUSED"); }, incr: async () => { throw new Error("ECONNREFUSED"); } };
  assert.deepEqual(await getOrSet(down, "g", "k", 60, loader), { value: 2, status: "OFF" });
  assert.equal(n, 2, "load נקרא פעם אחת בלבד");
  const writeFails = { get: async () => null, set: async () => { throw new Error("READONLY"); } };
  assert.deepEqual(await getOrSet(writeFails, "g", "k", 60, loader), { value: 3, status: "MISS" });
  await invalidate(null, "g");
  await invalidate(down, "g"); // לא זורק
});
test("load זרק ← השגיאה עולה, ו־load לא רץ פעמיים", async (t) => {
  const { redis } = await redisSandbox(t);
  let calls = 0;
  await assert.rejects(getOrSet(redis, "g", "k", 60, async () => { calls++; throw new Error("db down"); }), { message: "db down" });
  assert.equal(calls, 1);
});
