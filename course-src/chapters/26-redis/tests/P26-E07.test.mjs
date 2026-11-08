import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createCacheAside } = await load(import.meta.url, "P26-E07.ts");

test("miss ← load ← hit", async (t) => {
  const { redis } = await redisSandbox(t);
  const c = createCacheAside(redis);
  let calls = 0;
  const load = async () => ({ n: ++calls });
  assert.deepEqual(await c.get("k", 60, load), { n: 1 });
  assert.deepEqual(await c.get("k", 60, load), { n: 1 }, "מה־cache");
  assert.equal(calls, 1);
  assert.deepEqual(c.stats, { hits: 1, misses: 1 });
  assert.ok((await redis.ttl("k")) > 0, "עם TTL");
  await c.invalidate("k");
  assert.deepEqual(await c.get("k", 60, load), { n: 2 });
});
test("שגיאה ו־null לא נשמרים", async (t) => {
  const { redis } = await redisSandbox(t);
  const c = createCacheAside(redis);
  await assert.rejects(c.get("k", 60, async () => { throw new Error("db down"); }), { message: "db down" });
  assert.equal(await redis.exists("k"), 0);
  assert.equal(await c.get("k", 60, async () => null), null);
  assert.equal(await redis.exists("k"), 0, "null לא נשמר — אחרת 'לא קיים' נתקע ל־TTL שלם");
  assert.deepEqual(await c.get("k", 60, async () => [1]), [1]);
  assert.equal(c.stats.misses, 3);
});
