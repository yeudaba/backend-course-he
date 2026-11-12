import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { startSecondChanceWorker } = await load(import.meta.url, "P26.5-E54.ts");

async function setup(t) {
  const r = await rabbitSandbox(t);
  const q = r.queue("work"), dlx = r.exchange("dlx"), dead = r.queue("dead");
  await r.admin.assertExchange(dlx, "fanout", { durable: true });
  await r.admin.assertQueue(dead, { durable: true });
  await r.admin.bindQueue(dead, dlx, "");
  await r.admin.assertQueue(q, { durable: true, deadLetterExchange: dlx });
  return { r, q, dead };
}
const send = (r, q, body) => r.admin.sendToQueue(q, Buffer.from(typeof body === "string" ? body : JSON.stringify(body)));

test("שגיאה רגעית — עוברת בניסיון השני; קבועה — dead אחרי שניים", async (t) => {
  const { r, q, dead } = await setup(t);
  const calls = {};
  const done = [];
  await startSecondChanceWorker(await r.channel(), q, async (job) => {
    calls[job.id] = (calls[job.id] ?? 0) + 1;
    if (job.id === "flaky" && calls.flaky === 1) throw new Error("timeout");
    if (job.id === "bad") throw new Error("invalid");
    done.push(job.id);
  });
  for (const id of ["a", "flaky", "bad", "b"]) send(r, q, { id });
  await waitFor(async () => done.length === 3 && (await r.depth(dead)) === 1, { message: `done=${done}` });
  await sleep(200);
  assert.deepEqual(done.sort(), ["a", "b", "flaky"]);
  assert.deepEqual(calls, { a: 1, flaky: 2, bad: 2, b: 1 });
  assert.equal(await r.depth(q), 0);
  const [m] = await r.drain(dead);
  assert.equal(JSON.parse(m.body).id, "bad");
});
test("JSON פגום — dead מיד, בלי לקרוא ל־handler", async (t) => {
  const { r, q, dead } = await setup(t);
  let calls = 0;
  await startSecondChanceWorker(await r.channel(), q, async () => void calls++);
  send(r, q, "{oops");
  await waitFor(async () => (await r.depth(dead)) === 1);
  assert.equal(calls, 0);
});
