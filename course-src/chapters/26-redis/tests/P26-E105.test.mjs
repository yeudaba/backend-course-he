import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { productsApp } = await load(import.meta.url, "P26-E105.ts");

async function start(t, redis, ttl) {
  const calls = [];
  const loadProducts = async (q) => { calls.push(q); return [{ name: `${q || "all"}-${calls.length}` }]; };
  const { base, close } = await listen(productsApp({ redis, loadProducts, ...(ttl ? { ttl } : {}) }));
  t.after(close);
  return { base, calls };
}
const get = async (base, q) => {
  const r = await fetch(`${base}/products${q === undefined ? "" : `?q=${encodeURIComponent(q)}`}`);
  return { status: r.status, cache: r.headers.get("x-cache"), body: await r.json() };
};

test("MISS ← HIT, נרמול q, וביטול", async (t) => {
  const sb = await redisSandbox(t);
  const { base, calls } = await start(t, sb.redis);
  assert.deepEqual(await get(base, "V60"), { status: 200, cache: "MISS", body: [{ name: "v60-1" }] });
  assert.deepEqual(await get(base, " v60 "), { status: 200, cache: "HIT", body: [{ name: "v60-1" }] });
  assert.deepEqual(calls, ["v60"], "loadProducts מקבל את q המנורמל");
  assert.equal(await sb.raw.get(`${sb.prefix}cache:products:0:v60`), '[{"name":"v60-1"}]');
  const ttl = await sb.raw.ttl(`${sb.prefix}cache:products:0:v60`);
  assert.ok(ttl > 55 && ttl <= 60, `ttl ברירת מחדל 60 (${ttl})`);
  assert.equal((await get(base)).cache, "MISS");
  const inv = await fetch(`${base}/products/invalidate`, { method: "POST" });
  assert.equal(inv.status, 204);
  assert.equal(await sb.raw.get(`${sb.prefix}v:products`), "1");
  assert.deepEqual(await get(base, "V60"), { status: 200, cache: "MISS", body: [{ name: "v60-3" }] });
});
test("בלי Redis, או Redis שנופל ← OFF ו־200", async (t) => {
  const a = await start(t, null);
  assert.deepEqual(await get(a.base, "x"), { status: 200, cache: "OFF", body: [{ name: "x-1" }] });
  assert.equal((await fetch(`${a.base}/products/invalidate`, { method: "POST" })).status, 204);
  const down = { get: async () => { throw new Error("ECONNREFUSED"); }, set: async () => { throw new Error("x"); }, incr: async () => { throw new Error("x"); } };
  const b = await start(t, down);
  assert.deepEqual(await get(b.base, "x"), { status: 200, cache: "OFF", body: [{ name: "x-1" }] });
  assert.equal((await fetch(`${b.base}/products/invalidate`, { method: "POST" })).status, 204);
});
test("ttl מותאם", async (t) => {
  const sb = await redisSandbox(t);
  const { base } = await start(t, sb.redis, 5);
  await get(base, "a");
  assert.ok((await sb.raw.ttl(`${sb.prefix}cache:products:0:a`)) <= 5);
});
