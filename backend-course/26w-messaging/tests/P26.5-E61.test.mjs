import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { startConsumer } = await load(import.meta.url, "P26.5-E61.ts");

test("stop באמצע: מה שהתחיל — הסתיים עם ack; מה שלא — בתור", async (t) => {
  const r = await rabbitSandbox(t);
  const q = r.queue("work");
  await r.admin.assertQueue(q, { durable: true });
  for (let i = 1; i <= 10; i++) r.admin.sendToQueue(q, Buffer.from(JSON.stringify({ i })));
  const started = [], finished = [];
  const c = await startConsumer(await r.channel(), q, async (job) => {
    started.push(job.i);
    await sleep(150);
    finished.push(job.i);
  }, 3);
  await waitFor(() => started.length === 3);
  const stopping = c.stop();
  await stopping;
  assert.deepEqual(finished.sort((a, b) => a - b), started.sort((a, b) => a - b), "כל מה שהתחיל — הסתיים לפני ש־stop חזר");
  assert.equal(started.length, 3, `התחילו ${started.length} — אחרי cancel לא מגיעות חדשות`);
  await sleep(100);
  assert.equal(await r.depth(q), 7, "השאר מחכות בתור — ה־3 קיבלו ack");
  const left = (await r.drain(q)).map((m) => JSON.parse(m.body).i).sort((a, b) => a - b);
  assert.deepEqual(left, [4, 5, 6, 7, 8, 9, 10]);
});
