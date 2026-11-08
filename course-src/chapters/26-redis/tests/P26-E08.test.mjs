import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { trackView, topProducts } = await load(import.meta.url, "P26-E08.ts");
const d1 = new Date("2026-11-08T10:00:00Z");
const d2 = new Date("2026-11-09T10:00:00Z");

test("מונה לכל יום", async (t) => {
  const { redis } = await redisSandbox(t);
  assert.equal(await trackView(redis, 7, d1), 1);
  assert.equal(await trackView(redis, 7, d1), 2);
  assert.equal(await trackView(redis, 7, d2), 1, "יום חדש — מונה חדש");
  assert.equal(await redis.hget("views:2026-11-08", "7"), "2");
  const ttl = await redis.ttl("views:2026-11-08");
  assert.ok(ttl > 6 * 86400 && ttl <= 7 * 86400, "נמחק לבד אחרי שבוע");
});
test("במקביל — אף צפייה לא הולכת לאיבוד", async (t) => {
  const { redis } = await redisSandbox(t);
  await Promise.all(Array.from({ length: 50 }, () => trackView(redis, 3, d1)));
  assert.equal(await redis.hget("views:2026-11-08", "3"), "50", "HINCRBY אטומי — לא GET ואז SET");
});
test("topProducts", async (t) => {
  const { redis } = await redisSandbox(t);
  for (const [id, n] of [[1, 3], [2, 5], [3, 1], [4, 5]]) for (let i = 0; i < n; i++) await trackView(redis, id, d1);
  await trackView(redis, 9, d2);
  const top = await topProducts(redis, "2026-11-08", 3);
  assert.deepEqual(top.map((x) => x.views), [5, 5, 3]);
  assert.deepEqual(top.slice(0, 2).map((x) => x.productId).sort(), [2, 4]);
  assert.equal(top[2].productId, 1);
  assert.deepEqual(await topProducts(redis, "2026-11-10", 3), []);
});
