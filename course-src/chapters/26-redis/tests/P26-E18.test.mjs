import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { processOnce } = await load(import.meta.url, "P26-E18.ts");

test("אותה הודעה פעמיים — מטופלת פעם אחת", async (t) => {
  const { redis } = await redisSandbox(t);
  let charges = 0;
  const handler = async () => ++charges;
  assert.deepEqual(await processOnce(redis, "payment-7", 3600, handler), { processed: true, result: 1 });
  assert.deepEqual(await processOnce(redis, "payment-7", 3600, handler), { processed: false });
  assert.equal(charges, 1);
  assert.ok((await redis.ttl("processed:payment-7")) > 3500, "עם תוקף — לא נשמר לנצח");
});
test("במקביל, משני שרתים", async (t) => {
  const sb = await redisSandbox(t);
  const other = await sb.client();
  let n = 0;
  const results = await Promise.all(Array.from({ length: 10 }, (_, i) => processOnce(i % 2 ? sb.redis : other, "m-1", 60, async () => ++n)));
  assert.equal(n, 1);
  assert.equal(results.filter((r) => r.processed).length, 1);
});
test("כישלון — אפשר לנסות שוב", async (t) => {
  const { redis } = await redisSandbox(t);
  await assert.rejects(processOnce(redis, "m-2", 60, async () => { throw new Error("db down"); }), { message: "db down" });
  assert.deepEqual(await processOnce(redis, "m-2", 60, async () => "ok"), { processed: true, result: "ok" });
});
