import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { getOrSetJitter } = await load(import.meta.url, "P26-E51.ts");

test("MISS ואז HIT, עם ה־TTL לפי random", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  let calls = 0;
  const loader = async () => { calls++; return { n: calls }; };
  assert.deepEqual(await getOrSetJitter(redis, "a", 100, loader, () => 0), { n: 1 });
  assert.deepEqual(await getOrSetJitter(redis, "a", 100, loader, () => 0), { n: 1 }, "HIT — בלי load");
  assert.equal(calls, 1);
  assert.equal(await raw.ttl(`${prefix}a`), 100, "random() = 0 ← בדיוק ttl");
  await getOrSetJitter(redis, "b", 100, loader, () => 0.999);
  assert.equal(await raw.ttl(`${prefix}b`), 119, "random() = 0.999 ← ttl + floor(19.98)");
  await getOrSetJitter(redis, "c", 50, loader, () => 0.5);
  assert.equal(await raw.ttl(`${prefix}c`), 55);
});
test("ברירת מחדל Math.random — TTLs שונים, בטווח", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const ttls = new Set();
  for (let i = 0; i < 30; i++) {
    await getOrSetJitter(redis, `k${i}`, 1000, async () => i);
    const ttl = await raw.ttl(`${prefix}k${i}`);
    assert.ok(ttl >= 999 && ttl <= 1200, `ttl ${ttl}`);
    ttls.add(ttl);
  }
  assert.ok(ttls.size > 5, `רק ${ttls.size} ערכי TTL שונים — אין רעש`);
});
test("0 ו־false הם ערכים; שגיאה לא נשמרת", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  let calls = 0;
  await getOrSetJitter(redis, "zero", 10, async () => { calls++; return 0; });
  assert.equal(await getOrSetJitter(redis, "zero", 10, async () => { calls++; return 5; }), 0);
  assert.equal(calls, 1, "0 שמור — HIT");
  await assert.rejects(getOrSetJitter(redis, "bad", 10, async () => { throw new Error("db down"); }), { message: "db down" });
  assert.equal(await raw.exists(`${prefix}bad`), 0);
});
