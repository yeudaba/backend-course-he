import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createL1Cache } = await load(import.meta.url, "P26-E19.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("ביטול בשרת אחד ← כל השרתים", async (t) => {
  const sb = await redisSandbox(t);
  const channel = `inv-${sb.prefix}`;
  const a = await createL1Cache(sb.redis, await sb.client(), channel);
  const b = await createL1Cache(await sb.client(), await sb.client(), channel);
  let version = 1;
  const load = async () => ({ price: version * 100 });
  assert.deepEqual(await a.get("p:1", load), { price: 100 });
  assert.deepEqual(await b.get("p:1", load), { price: 100 });
  version = 2;
  assert.deepEqual(await b.get("p:1", load), { price: 100 }, "L1 — עדיין העותק המקומי");
  await a.invalidate("p:1");
  await sleep(150);
  assert.deepEqual(await a.get("p:1", load), { price: 200 });
  assert.deepEqual(await b.get("p:1", load), { price: 200 }, "גם השרת השני קיבל את ההודעה ומחק");
  assert.equal(b.size(), 1);
});
