import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { enqueue, drain } = await load(import.meta.url, "P26-E79.ts");

test("FIFO, וכישלון עובר ל־failed", async (t) => {
  const { redis, raw, prefix } = await redisSandbox(t);
  assert.equal(await enqueue(redis, "mail", { to: "a" }), 1);
  assert.equal(await enqueue(redis, "mail", { to: "bad" }), 2);
  assert.equal(await enqueue(redis, "mail", { to: "c" }), 3);
  assert.equal(await raw.lindex(`${prefix}q:mail`, 0), '{"to":"a"}', "JSON בסוף list בשם q:<queue>");
  const seen = [];
  const r = await drain(redis, "mail", async (job) => {
    if (job.to === "bad") throw new Error("כתובת לא קיימת");
    seen.push(job.to);
  });
  assert.deepEqual(seen, ["a", "c"], "לפי הסדר שנכנסו");
  assert.deepEqual(r, { done: 2, failed: 1 });
  assert.equal(await raw.llen(`${prefix}q:mail`), 0);
  const failed = (await raw.lrange(`${prefix}q:mail:failed`, 0, -1)).map((x) => JSON.parse(x));
  assert.deepEqual(failed, [{ job: { to: "bad" }, error: "כתובת לא קיימת" }]);
  assert.deepEqual(await drain(redis, "empty", async () => {}), { done: 0, failed: 0 });
});
test("שני workers במקביל — כל עבודה פעם אחת", async (t) => {
  const sb = await redisSandbox(t);
  const second = await sb.client();
  for (let i = 0; i < 60; i++) await enqueue(sb.redis, "jobs", i);
  const seen = [];
  const handler = async (n) => { seen.push(n); await new Promise((r) => setTimeout(r, 1)); };
  const [a, b] = await Promise.all([drain(sb.redis, "jobs", handler), drain(second, "jobs", handler)]);
  assert.equal(a.done + b.done, 60);
  assert.equal(new Set(seen).size, 60, "אף עבודה לא טופלה פעמיים");
  assert.equal(seen.length, 60);
});
