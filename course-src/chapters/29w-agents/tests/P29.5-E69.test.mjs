import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createApprovalStore } = await load(import.meta.url, "P29.5-E69.ts");
const state = { messages: [{ role: "user", content: "החזר" }], pending: [{ id: "t1", name: "refund_order", input: { orderId: 201, amountCents: 8990 } }] };

test("save / peek / take, ותפוגה", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  const s = createApprovalStore(redis, { ttlSeconds: 600 });
  await s.save("r1", state);
  assert.deepEqual(JSON.parse(await raw.get(`${prefix}agent:approval:r1`)), state);
  const ttl = await raw.ttl(`${prefix}agent:approval:r1`);
  assert.ok(ttl > 590 && ttl <= 600, `ttl ${ttl}`);
  assert.deepEqual(await s.peek("r1"), state);
  assert.deepEqual(await s.peek("r1"), state, "peek לא מוחק");
  assert.deepEqual(await s.take("r1"), state);
  assert.equal(await s.take("r1"), null);
  assert.equal(await s.peek("r1"), null);
  assert.equal(await s.peek("nope"), null);
});
test("take במקביל — רק אחד מקבל", async (t) => {
  const { redis, client } = await redisSandbox(t);
  const other = await client();
  const a = createApprovalStore(redis, { ttlSeconds: 60 });
  const b = createApprovalStore(other, { ttlSeconds: 60 });
  await a.save("r2", state);
  const r = await Promise.all([a.take("r2"), b.take("r2"), a.take("r2"), b.take("r2")]);
  assert.equal(r.filter((x) => x !== null).length, 1);
  await a.save("r3", 0);
  assert.equal(await b.take("r3"), 0, "0 הוא מצב, לא null");
});
