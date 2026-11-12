import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { appendEvent, eventsAfter } = await load(import.meta.url, "P26-E120.ts");

test("id עולה, eventsAfter, ומפתחות", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.equal(await appendEvent(redis, "orders", "status", { orderId: 7, status: "paid" }), 1);
  assert.equal(await appendEvent(redis, "orders", "status", { orderId: 7, status: "shipped" }), 2);
  assert.equal(await appendEvent(redis, "other", "x", 1), 1, "stream אחר — מונה משלו");
  assert.deepEqual(await eventsAfter(redis, "orders", 1), [{ id: 2, event: "status", data: { orderId: 7, status: "shipped" } }]);
  assert.equal((await eventsAfter(redis, "orders", 0)).length, 2);
  assert.deepEqual(await eventsAfter(redis, "orders", 2), []);
  assert.deepEqual(await eventsAfter(redis, "nothing", 0), []);
  assert.equal(await raw.get(`${prefix}sse:orders:seq`), "2");
  assert.equal(await raw.llen(`${prefix}sse:orders:log`), 2);
});
test("max — רק האחרונים נשמרים", async (t) => {
  const { redis } = await redisSandbox(t);
  for (let i = 1; i <= 8; i++) await appendEvent(redis, "s", "e", i, 5);
  assert.deepEqual((await eventsAfter(redis, "s", 0)).map((e) => e.id), [4, 5, 6, 7, 8]);
  for (let i = 0; i < 120; i++) await appendEvent(redis, "d", "e", i);
  const d = await eventsAfter(redis, "d", 0);
  assert.equal(d.length, 100, "ברירת מחדל 100");
  assert.equal(d[0].id, 21);
});
test("40 במקביל משני שרתים — ids שונים, ממוינים", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  const ids = await Promise.all(Array.from({ length: 40 }, (_, i) => appendEvent(i % 2 ? second : sb.redis, "p", "e", i)));
  assert.equal(new Set(ids).size, 40);
  assert.deepEqual(ids.slice().sort((a, b) => a - b), Array.from({ length: 40 }, (_, i) => i + 1));
  const all = await eventsAfter(second, "p", 0);
  assert.deepEqual(all.map((e) => e.id), Array.from({ length: 40 }, (_, i) => i + 1), "ממוין לפי id");
  assert.deepEqual((await eventsAfter(sb.redis, "p", 35)).map((e) => e.id), [36, 37, 38, 39, 40]);
});
