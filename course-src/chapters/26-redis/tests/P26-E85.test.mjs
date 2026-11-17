import { test } from "node:test";
import assert from "node:assert/strict";
import { Queue, QueueEvents } from "bullmq";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { startWorkerWithTimeout } = await load(import.meta.url, "P26-E85.ts");

async function setup(t, handler, timeoutMs) {
  const sb = await redisSandbox(t);
  const queue = new Queue("smtp", { connection: sb.connection(), prefix: sb.bullPrefix });
  const events = new QueueEvents("smtp", { connection: sb.connection(), prefix: sb.bullPrefix });
  await events.waitUntilReady();
  let worker;
  t.after(async () => { await worker?.close(); await events.close(); await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); });
  worker = startWorkerWithTimeout(sb.connection(), sb.bullPrefix, "smtp", handler, timeoutMs);
  assert.equal(typeof worker?.close, "function", "מחזיר Worker");
  const failures = [];
  worker.on("failed", (job, err) => failures.push(err.message));
  return { queue, events, failures };
}

test("נתקע בפעם הראשונה ← TIMEOUT, וניסיון חוזר מצליח", async (t) => {
  let calls = 0;
  const handler = async (data) => {
    calls++;
    if (calls === 1) return new Promise(() => {}); // נתקע לנצח
    return `sent to ${data.to}`;
  };
  const { queue, events, failures } = await setup(t, handler, 150);
  const job = await queue.add("mail", { to: "dana" }, { attempts: 3, backoff: { type: "fixed", delay: 50 } });
  assert.equal(await job.waitUntilFinished(events, 8000), "sent to dana");
  await new Promise((r) => setTimeout(r, 100));
  assert.deepEqual(failures, ["TIMEOUT"]);
  assert.equal(calls, 2);
});
test("מסתיים בזמן — התוצאה, ושגיאה אמיתית עוברת כמו שהיא", async (t) => {
  const handler = async (data) => {
    await new Promise((r) => setTimeout(r, 20));
    if (data.bad) throw new Error("550 mailbox unavailable");
    return data.n * 2;
  };
  const { queue, events, failures } = await setup(t, handler, 500);
  const ok = await queue.add("mail", { n: 21 });
  assert.equal(await ok.waitUntilFinished(events, 8000), 42);
  const bad = await queue.add("mail", { bad: true });
  await assert.rejects(bad.waitUntilFinished(events, 8000), /550/);
  await new Promise((r) => setTimeout(r, 100));
  assert.deepEqual(failures, ["550 mailbox unavailable"]);
});
