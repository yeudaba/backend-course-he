import { test } from "node:test";
import assert from "node:assert/strict";
import { Queue, Worker } from "bullmq";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { queueStats, retryAllFailed } = await load(import.meta.url, "P26-E78.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(50)) if (await fn()) return true;
  return false;
}

test("סטטיסטיקה, ו־retry לכל ה־failed (גם יותר מ־10)", async (t) => {
  const sb = await redisSandbox(t);
  const queue = new Queue("mail", { connection: sb.connection(), prefix: sb.bullPrefix });
  let smtpUp = false;
  const worker = new Worker("mail", async () => { if (!smtpUp) throw new Error("smtp down"); return "sent"; }, { connection: sb.connection(), prefix: sb.bullPrefix });
  t.after(async () => { await worker.close(); await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); });

  assert.deepEqual(await queueStats(queue), { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 });
  await queue.add("later", {}, { delay: 60_000 });
  for (let i = 0; i < 13; i++) await queue.add("m", { i });
  assert.ok(await until(async () => (await queue.getFailedCount()) === 13, 8000), "13 נכשלו");
  assert.deepEqual(await queueStats(queue), { waiting: 0, active: 0, delayed: 1, completed: 0, failed: 13 });

  smtpUp = true;
  assert.equal(await retryAllFailed(queue), 13);
  assert.ok(await until(async () => (await queue.getCompletedCount()) === 13, 8000), "כולן הושלמו אחרי retry");
  const s = await queueStats(queue);
  assert.equal(s.failed, 0);
  assert.equal(s.completed, 13);
  assert.equal(await retryAllFailed(queue), 0);
});
