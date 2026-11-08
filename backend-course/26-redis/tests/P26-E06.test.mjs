import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createJsonStore } = await load(import.meta.url, "P26-E06.ts");

test("set / get — כל סוג JSON", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const s = createJsonStore(redis);
  await s.set("user:1", { name: "דנה", tags: ["admin"], age: 30 });
  assert.deepEqual(await s.get("user:1"), { name: "דנה", tags: ["admin"], age: 30 });
  await s.set("n", 0);
  assert.equal(await s.get("n"), 0, "0 הוא ערך, לא 'אין'");
  await s.set("b", false);
  assert.equal(await s.get("b"), false);
  assert.equal(await s.get("missing"), null);
  assert.equal(await raw.get(`${prefix}user:1`), '{"name":"דנה","tags":["admin"],"age":30}', "נשמר כ־JSON");
});
test("TTL", async (t) => {
  const { redis } = await redisSandbox(t);
  const s = createJsonStore(redis);
  await s.set("a", 1, 60);
  const ttl = await s.ttl("a");
  assert.ok(ttl > 55 && ttl <= 60, `ttl ${ttl}`);
  await s.set("b", 1);
  assert.equal(await s.ttl("b"), Infinity);
  assert.equal(await s.ttl("nope"), null);
  await s.set("c", 1, 1);
  await new Promise((r) => setTimeout(r, 1100));
  assert.equal(await s.get("c"), null, "פג תוקף");
});
test("del ו־undefined", async (t) => {
  const { redis } = await redisSandbox(t);
  const s = createJsonStore(redis);
  await s.set("a", 1);
  assert.equal(await s.del("a"), true);
  assert.equal(await s.del("a"), false);
  await assert.rejects(s.set("x", undefined), { message: "אין ערך לשמור" });
});
