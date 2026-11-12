import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createJobs } = await load(import.meta.url, "P26-E96.ts");

test("עבודות עם jobId קבוע והגדרות הפרויקט", async (t) => {
  const sb = await redisSandbox(t);
  const jobs = createJobs(sb.connection(), sb.bullPrefix);
  t.after(async () => { await jobs.queue.obliterate({ force: true }).catch(() => {}); await jobs.close(); });
  assert.equal(jobs.queue.name, "shop");
  assert.equal(await jobs.add("order-confirmation", 7), true);
  assert.equal(await jobs.add("order-confirmation", 7), true);
  assert.equal(await jobs.add("expire-order", 7, 30_000), true);
  const c = await jobs.queue.getJob("order-confirmation-7");
  assert.ok(c, "jobId order-confirmation-7");
  assert.deepEqual(c.data, { orderId: 7 });
  assert.equal(c.opts.attempts, 5);
  assert.deepEqual(c.opts.backoff, { type: "exponential", delay: 1000 });
  assert.equal(c.opts.removeOnComplete, 1000);
  assert.equal(c.opts.removeOnFail, 5000);
  const e = await jobs.queue.getJob("expire-order-7");
  assert.equal(e.opts.delay, 30_000);
  assert.equal(await jobs.queue.getWaitingCount(), 1, "הוספה כפולה = עבודה אחת");
  assert.equal(await jobs.queue.getDelayedCount(), 1);
});
test("שם לא מוכר ← שגיאה, ושום דבר לא נוסף", async (t) => {
  const sb = await redisSandbox(t);
  const jobs = createJobs(sb.connection(), sb.bullPrefix);
  t.after(async () => { await jobs.queue.obliterate({ force: true }).catch(() => {}); await jobs.close(); });
  await assert.rejects(jobs.add("send-sms", 1));
  const counts = await jobs.queue.getJobCounts("waiting", "delayed");
  assert.equal(counts.waiting + counts.delayed, 0);
});
