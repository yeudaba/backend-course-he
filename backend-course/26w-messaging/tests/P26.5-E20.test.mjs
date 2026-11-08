import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { startEmailWorker } = await load(import.meta.url, "P26.5-E20.ts");

async function setup(t) {
  const r = await rabbitSandbox(t);
  const dlx = r.exchange("dlx");
  const dead = r.queue("dead");
  const queue = r.queue("emails");
  await r.admin.assertExchange(dlx, "fanout");
  await r.admin.assertQueue(dead);
  await r.admin.bindQueue(dead, dlx, "");
  await r.admin.assertQueue(queue, { deadLetterExchange: dlx });
  return { r, queue, dead };
}
const send = (r, q, i) => r.admin.sendToQueue(q, Buffer.from(JSON.stringify({ to: `u${i}@example.com`, subject: `#${i}` })));

test("באג 1: ack אחרי השליחה — worker שנופל באמצע לא מאבד הודעה", async (t) => {
  const { r, queue } = await setup(t);
  send(r, queue, 1);
  const conn = await r.connect();
  const ch = await conn.createChannel();
  let started;
  const inFlight = new Promise((res) => (started = res));
  await startEmailWorker(ch, queue, async () => {
    started();
    await new Promise(() => {}); // "שולח"… והתהליך נופל באמצע
  });
  await inFlight;
  await sleep(200); // נותנים ל־ack (אם נשלח) להגיע ל־broker
  await conn.close(); // הקריסה
  await waitFor(async () => (await r.depth(queue)) === 1, { message: "ההודעה אבדה: אושרה (ack) לפני שהמייל נשלח" });
});
test("באג 2: prefetch — לא כל התור לזיכרון בבת אחת", async (t) => {
  const { r, queue } = await setup(t);
  for (let i = 1; i <= 40; i++) send(r, queue, i);
  const ch = await (await r.connect()).createChannel();
  let now = 0;
  let peak = 0;
  let done = 0;
  await startEmailWorker(ch, queue, async () => {
    peak = Math.max(peak, ++now);
    await sleep(30);
    now--;
    done++;
  });
  await waitFor(() => done === 40, { timeout: 15000 });
  assert.ok(peak <= 20, `${peak} מיילים בו־זמנית — אין prefetch`);
});
test("באג 3: כישלון ← dead letter, לא לולאה אינסופית", async (t) => {
  const { r, queue, dead } = await setup(t);
  send(r, queue, 1);
  const ch = await (await r.connect()).createChannel();
  let calls = 0;
  await startEmailWorker(ch, queue, async () => {
    calls++;
    throw new Error("invalid address");
  });
  await sleep(500);
  assert.ok(calls <= 2, `נוסה ${calls} פעמים בחצי שנייה — nack עם requeue=true חוזר לראש התור מיד`);
  await waitFor(async () => (await r.depth(dead)) === 1);
});
