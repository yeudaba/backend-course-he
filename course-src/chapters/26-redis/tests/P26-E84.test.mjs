import { test } from "node:test";
import assert from "node:assert/strict";
import { Queue } from "bullmq";
import { load, listen } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { payApp } = await load(import.meta.url, "P26-E84.ts");

async function setup(t, pending) {
  const sb = await redisSandbox(t);
  const queue = new Queue("mail", { connection: sb.connection(), prefix: sb.bullPrefix });
  t.after(async () => { await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); });
  const paid = [];
  const markPaid = async (id) => { if (!pending.has(id)) return false; pending.delete(id); paid.push(id); return true; };
  const { base, close } = await listen(payApp({ queue, markPaid }));
  t.after(close);
  return { queue, base, paid };
}
const pay = (base, id) => fetch(`${base}/orders/${id}/pay`, { method: "POST" });

test("תשלום ← 202 ועבודה בתור, בלי worker", async (t) => {
  const { queue, base, paid } = await setup(t, new Set([7, 8]));
  const r = await pay(base, 7);
  assert.equal(r.status, 202);
  assert.deepEqual(await r.json(), { status: "paid" });
  assert.deepEqual(paid, [7]);
  const job = await queue.getJob("confirm-7");
  assert.ok(job, "עבודה עם jobId confirm-7");
  assert.equal(job.name, "order-confirmation");
  assert.deepEqual(job.data, { orderId: 7 });
  assert.equal(job.opts.attempts, 3);
  assert.equal(job.opts.backoff?.type, "exponential");
});
test("404 ו־400 — בלי עבודה; ו־jobId מונע כפילות", async (t) => {
  const { queue, base } = await setup(t, new Set([5]));
  assert.equal((await pay(base, 99)).status, 404);
  for (const id of ["0", "abc", "-3"]) assert.equal((await pay(base, id)).status, 400, `id=${id}`);
  assert.equal(await queue.getWaitingCount(), 0);
  await pay(base, 5);
  await queue.add("order-confirmation", { orderId: 5 }, { jobId: "confirm-5" }); // לחיצה כפולה שהגיעה בדרך אחרת
  assert.equal(await queue.getWaitingCount(), 1);
});
