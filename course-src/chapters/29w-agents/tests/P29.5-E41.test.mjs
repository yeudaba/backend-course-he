import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createRunSlots } = await load(import.meta.url, "P29.5-E41.ts");

test("תקרה, שחרור, TTL", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const s = createRunSlots(redis, { maxPerUser: 2, ttlSeconds: 300 });
  assert.equal(await s.active("u1"), 0);
  assert.equal(await s.acquire("u1"), true);
  assert.equal(await s.acquire("u1"), true);
  assert.equal(await s.acquire("u1"), false);
  assert.equal(await s.active("u1"), 2, "ניסיון שנכשל לא נשאר במונה");
  assert.equal(await s.acquire("u2"), true, "לקוח אחר");
  const ttl = await raw.ttl(`${prefix}agent:runs:u1`);
  assert.ok(ttl > 290 && ttl <= 300, `TTL ${ttl}`);
  await s.release("u1");
  assert.equal(await s.active("u1"), 1);
  assert.equal(await s.acquire("u1"), true);
});
test("release כפול לא משאיר מונה שלילי", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const s = createRunSlots(redis, { maxPerUser: 1, ttlSeconds: 60 });
  await s.acquire("u");
  await s.release("u");
  await s.release("u");
  assert.equal(await s.active("u"), 0);
  assert.equal(await raw.exists(`${prefix}agent:runs:u`), 0);
  assert.equal(await s.acquire("u"), true);
  assert.equal(await s.acquire("u"), false, "לא קיבלנו 'קרדיט' מה־release הכפול");
});
test("שני שרתים, acquire במקביל", async (t) => {
  const { redis, client } = await redisSandbox(t);
  const other = await client();
  const a = createRunSlots(redis, { maxPerUser: 3, ttlSeconds: 60 });
  const b = createRunSlots(other, { maxPerUser: 3, ttlSeconds: 60 });
  const r = await Promise.all(Array.from({ length: 10 }, (_, i) => (i % 2 ? a : b).acquire("u")));
  assert.equal(r.filter(Boolean).length, 3);
  assert.equal(await a.active("u"), 3);
});
