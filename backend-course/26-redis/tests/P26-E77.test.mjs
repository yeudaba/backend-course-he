import { test } from "node:test";
import assert from "node:assert/strict";
import { Queue, QueueEvents } from "bullmq";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { startImportWorker } = await load(import.meta.url, "P26-E77.ts");

async function setup(t, handleItem) {
  const sb = await redisSandbox(t);
  const queue = new Queue("imports", { connection: sb.connection(), prefix: sb.bullPrefix });
  const events = new QueueEvents("imports", { connection: sb.connection(), prefix: sb.bullPrefix });
  await events.waitUntilReady();
  let worker;
  t.after(async () => { await worker?.close(); await events.close(); await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); });
  worker = startImportWorker(sb.connection(), sb.bullPrefix, handleItem);
  assert.equal(typeof worker?.close, "function", "startImportWorker מחזיר Worker");
  return { queue, events };
}

test("לפי הסדר, התקדמות אחרי כל פריט, ותוצאה", async (t) => {
  const seen = [];
  const { queue, events } = await setup(t, async (item) => { seen.push(item); });
  const progress = [];
  events.on("progress", ({ data }) => progress.push(data));
  const job = await queue.add("import", { items: ["a", "b", "c"] });
  assert.deepEqual(await job.waitUntilFinished(events, 8000), { processed: 3 });
  assert.deepEqual(seen, ["a", "b", "c"]);
  await new Promise((r) => setTimeout(r, 100));
  assert.deepEqual(progress, [33, 67, 100], "אחוזים שלמים, אחרי כל פריט");
  assert.equal((await queue.getJob(job.id)).progress, 100);
});
test("בלי פריטים ← 100 ו־processed: 0; פריט שזרק ← העבודה נכשלת", async (t) => {
  const { queue, events } = await setup(t, async (item) => { if (item === "bad") throw new Error("שורה שבורה"); });
  const empty = await queue.add("import", { items: [] });
  assert.deepEqual(await empty.waitUntilFinished(events, 8000), { processed: 0 });
  assert.equal((await queue.getJob(empty.id)).progress, 100);
  const bad = await queue.add("import", { items: ["ok", "bad", "never"] });
  await assert.rejects(bad.waitUntilFinished(events, 8000), /שורה שבורה/);
  assert.equal(await (await queue.getJob(bad.id)).getState(), "failed");
});
