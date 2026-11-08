import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { cachedSearch } = await load(import.meta.url, "P26-E20.ts");

test("page הוא חלק מהמפתח", async (t) => {
  const { redis } = await redisSandbox(t);
  assert.deepEqual(await cachedSearch(redis, { q: "cups", page: 1 }, async () => ["a", "b"]), ["a", "b"]);
  assert.deepEqual(await cachedSearch(redis, { q: "cups", page: 2 }, async () => ["c"]), ["c"]);
});
test("עם TTL", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  await cachedSearch(redis, { q: "cups", page: 1 }, async () => ["a"]);
  const [key] = await raw.keys(`${prefix}*`);
  const ttl = await raw.ttl(key);
  assert.ok(ttl > 0, `לערך ב־cache יש תוקף (TTL=${ttl})`);
});
test("תוצאות \"ריקות\" נשמרות", async (t) => {
  const { redis } = await redisSandbox(t);
  let loads = 0;
  for (let i = 0; i < 3; i++) await cachedSearch(redis, { q: "nothing", page: 1 }, async () => { loads++; return []; });
  for (let i = 0; i < 3; i++) await cachedSearch(redis, { q: "count", page: 1 }, async () => { loads++; return 0; });
  assert.equal(loads, 2, "[] ו־0 — פעם אחת כל אחד, ואז מה־cache");
});
