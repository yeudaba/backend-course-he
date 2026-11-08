import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { setupWorkQueue, startWorker } = await load(import.meta.url, "P26.5-E07.ts");

async function setup(t) {
  const r = await rabbitSandbox(t);
  const w = { queue: r.queue("work"), deadLetterExchange: r.exchange("dlx"), deadLetterQueue: r.queue("dead") };
  const ch = await r.channel();
  await setupWorkQueue(ch, w);
  return { r, w, ch };
}
const send = (r, q, body) => r.admin.sendToQueue(q, Buffer.from(typeof body === "string" ? body : JSON.stringify(body)), { persistent: true });

test("הצלחה ← ack; כישלון ← dead letter (לא חזרה לתור)", async (t) => {
  const { r, w, ch } = await setup(t);
  for (let i = 1; i <= 6; i++) send(r, w.queue, { id: i });
  const done = [];
  let calls = 0;
  await startWorker(ch, w.queue, async (job) => {
    calls++;
    if (job.id % 3 === 0) throw new Error("boom");
    done.push(job.id);
  });
  await waitFor(async () => (await r.depth(w.deadLetterQueue)) === 2 && done.length === 4, { message: "ציפינו ל־4 שהצליחו ו־2 ב־dead letter" });
  await sleep(200);
  assert.equal(calls, 6, "כל הודעה טופלה פעם אחת — כישלון לא חוזר לראש התור בלולאה");
  assert.equal(await r.depth(w.queue), 0);
  const dead = await r.drain(w.deadLetterQueue);
  assert.deepEqual(dead.map((m) => JSON.parse(m.body).id).sort(), [3, 6]);
  assert.equal(dead[0].headers["x-death"]?.[0]?.reason, "rejected", "הגיעה דרך nack (x-death)");
});
test("JSON פגום ← dead letter", async (t) => {
  const { r, w, ch } = await setup(t);
  send(r, w.queue, "{not json");
  let calls = 0;
  await startWorker(ch, w.queue, async () => void calls++);
  await waitFor(async () => (await r.depth(w.deadLetterQueue)) === 1);
  assert.equal(calls, 0);
});
test("prefetch: לא יותר מ־N בטיפול בו־זמנית", async (t) => {
  const { r, w, ch } = await setup(t);
  for (let i = 1; i <= 12; i++) send(r, w.queue, { id: i });
  let now = 0;
  let peak = 0;
  let finished = 0;
  await startWorker(ch, w.queue, async () => {
    peak = Math.max(peak, ++now);
    await sleep(60);
    now--;
    finished++;
  }, { prefetch: 3 });
  await waitFor(() => finished === 12);
  assert.ok(peak <= 3, `היו ${peak} במקביל, עם prefetch 3`);
  assert.ok(peak >= 2, "ועדיין במקביל — לא אחת אחת");
});
