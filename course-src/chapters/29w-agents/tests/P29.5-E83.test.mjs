import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createRunStore } = await load(import.meta.url, "P29.5-E83.ts");

test("save / load / running / remove", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const s = createRunStore(redis, { ttlSeconds: 3600 });
  await s.save("r2", { step: 1 }, "running");
  await s.save("r1", { step: 4, messages: ["x"] }, "running");
  await s.save("r3", { step: 2 }, "waiting");
  assert.deepEqual(await s.running(), ["r1", "r2"]);
  assert.deepEqual(await s.load("r1"), { step: 4, messages: ["x"] });
  assert.equal(await s.load("nope"), null);
  const ttl = await raw.ttl(`${prefix}agent:run:r1`);
  assert.ok(ttl > 3590 && ttl <= 3600, `ttl ${ttl}`);
  assert.deepEqual((await raw.smembers(`${prefix}agent:runs:running`)).sort(), ["r1", "r2"]);
  await s.save("r2", { step: 9 }, "done");
  assert.deepEqual(await s.running(), ["r1"]);
  assert.deepEqual(await s.load("r2"), { step: 9 });
  await s.remove("r1");
  assert.deepEqual(await s.running(), []);
  assert.equal(await s.load("r1"), null);
  await s.save("r3", { step: 3 }, "running");
  assert.deepEqual(await s.running(), ["r3"]);
});
test("משתמש ב־MULTI", async (t) => {
  const { redis } = await redisSandbox(t);
  let multis = 0;
  const orig = redis.multi.bind(redis);
  redis.multi = (...args) => (multis++, orig(...args));
  const s = createRunStore(redis, { ttlSeconds: 60 });
  await s.save("a", {}, "running");
  await s.remove("a");
  assert.equal(multis, 2);
});
