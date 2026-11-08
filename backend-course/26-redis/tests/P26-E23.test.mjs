import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createConfirmations } = await load(import.meta.url, "P26-E23.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("מייל אחד להזמנה, ו־retry על כישלון זמני", async (t) => {
  const sb = await redisSandbox(t);
  const delivered = [];
  let smtpDown = 2;
  const c = createConfirmations(sb.connection(), sb.bullPrefix, async (orderId) => {
    if (orderId === 2 && smtpDown > 0) {
      smtpDown--;
      throw new Error("SMTP unavailable");
    }
    delivered.push(orderId);
  });
  t.after(() => c.close());
  const origError = console.error;
  console.error = () => {};
  t.after(() => { console.error = origError; });
  await c.send(1);
  await c.send(1);
  await c.send(2);
  for (const end = Date.now() + 8000; Date.now() < end && delivered.length < 2; ) await sleep(50);
  await sleep(500);
  assert.deepEqual(delivered.filter((x) => x === 1), [1], "הזמנה 1 — מייל אחד, גם כש־send נקרא פעמיים");
  assert.ok(delivered.includes(2), "הזמנה 2 — נשלח אחרי שה־SMTP חזר (retry)");
});
