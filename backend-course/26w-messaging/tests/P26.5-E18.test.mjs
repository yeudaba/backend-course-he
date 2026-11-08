import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor } from "../../tools/mq.mjs";

const { setupRetry, startRetryingWorker } = await load(import.meta.url, "P26.5-E18.ts");
const DELAY = 300;

async function setup(t) {
  const r = await rabbitSandbox(t);
  const n = { queue: r.queue("work"), retryQueue: r.queue("retry"), deadQueue: r.queue("dead") };
  const ch = await r.channel();
  await setupRetry(ch, n, DELAY);
  return { r, n, ch };
}

test("נכשל פעמיים, מצליח בשלישית — עם השהיה בין הניסיונות", async (t) => {
  const { r, n, ch } = await setup(t);
  const times = [];
  await startRetryingWorker(ch, n, async () => {
    times.push(Date.now());
    if (times.length < 3) throw new Error("temporary");
  }, { maxAttempts: 5 });
  r.admin.sendToQueue(n.queue, Buffer.from(JSON.stringify({ id: 1 })), { persistent: true });
  await waitFor(() => times.length === 3, { message: "ציפינו לשלושה ניסיונות" });
  assert.ok(times[1] - times[0] >= DELAY - 20, `ניסיון שני אחרי ${times[1] - times[0]}ms — צריך לחכות ${DELAY}`);
  assert.ok(times[2] - times[1] >= DELAY - 20);
  await waitFor(async () => (await r.depth(n.queue)) === 0 && (await r.depth(n.retryQueue)) === 0);
  assert.equal(await r.depth(n.deadQueue), 0);
});
test("נכשל תמיד ← אחרי maxAttempts ל־deadQueue, עם מספר הניסיונות והשגיאה", async (t) => {
  const { r, n, ch } = await setup(t);
  let calls = 0;
  await startRetryingWorker(ch, n, async () => {
    calls++;
    throw new Error("payment gateway down");
  }, { maxAttempts: 3 });
  r.admin.sendToQueue(n.queue, Buffer.from(JSON.stringify({ id: 7 })), { persistent: true });
  await waitFor(async () => (await r.depth(n.deadQueue)) === 1, { message: "ההודעה לא הגיעה ל־deadQueue" });
  assert.equal(calls, 3);
  const [m] = await r.drain(n.deadQueue);
  assert.deepEqual(JSON.parse(m.body), { id: 7 });
  assert.equal(Number(m.headers["x-attempts"]), 3);
  assert.match(String(m.headers["x-error"]), /payment gateway down/);
});
