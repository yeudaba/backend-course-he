import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createReminders, startReminderWorker } = await load(import.meta.url, "P26-E17.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

test("delay, וביטול לפני הזמן", async (t) => {
  const sb = await redisSandbox(t);
  const r = createReminders(sb.connection(), sb.bullPrefix);
  let worker;
  t.after(async () => { await worker?.close(); await r.close(); });
  const fired = [];
  const startedAt = Date.now();
  worker = startReminderWorker(sb.connection(), sb.bullPrefix, async (id) => { fired.push([id, Date.now() - startedAt]); });

  await r.schedule(1, 600);
  await r.schedule(2, 600);
  await r.schedule(3, 50);
  await sleep(250);
  assert.deepEqual(fired.map((f) => f[0]), [3], "רק הקצרה — עוד לא הגיע הזמן של 1 ו־2");
  assert.equal(await r.cancel(2), true, "2 שולמה — מבטלים");
  assert.equal(await r.cancel(2), false, "אין מה לבטל פעמיים");
  assert.equal(await r.cancel(99), false);
  await sleep(1000);
  assert.deepEqual(fired.map((f) => f[0]).sort(), [1, 3], "2 בוטלה ולא רצה");
  assert.ok(fired.find((f) => f[0] === 1)[1] >= 550, "1 רצה רק אחרי ה־delay");
  await r.schedule(1, 10);
  await sleep(300);
  assert.equal(fired.filter((f) => f[0] === 1).length, 1, "אותו jobId שכבר רץ — לא מתוזמן שוב (ברירת מחדל של BullMQ)");
});
