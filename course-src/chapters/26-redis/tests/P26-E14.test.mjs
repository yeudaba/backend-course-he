import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createVersionedCache } = await load(import.meta.url, "P26-E14.ts");

test("invalidate של קבוצה — כל הווריאציות, ורק היא", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const c = createVersionedCache(redis);
  let n = 0;
  const load = async () => ++n;
  for (const k of ["page=1", "page=2", "q=cups"]) assert.equal((await c.get("products", k, 60, load)).hit, false);
  await c.get("users", "all", 60, load);
  for (const k of ["page=1", "page=2", "q=cups"]) assert.equal((await c.get("products", k, 60, load)).hit, true);
  const before = n;
  await c.invalidate("products");
  for (const k of ["page=1", "page=2", "q=cups"]) {
    const r = await c.get("products", k, 60, load);
    assert.equal(r.hit, false, `${k} — אחרי invalidate`);
  }
  assert.equal(n, before + 3);
  assert.equal((await c.get("users", "all", 60, load)).hit, true, "קבוצה אחרת — לא נפגעה");
  const keys = await raw.keys(`${prefix}*`);
  assert.ok(keys.every((k) => k.endsWith(":v:products") || k.includes(":c:") ), "רק מפתחות c:… ו־v:…");
  const ttl = await raw.ttl(keys.find((k) => k.includes(":c:products:0:")));
  assert.ok(ttl > 0, "גם הגרסה הישנה עם TTL — תמות לבד");
});
