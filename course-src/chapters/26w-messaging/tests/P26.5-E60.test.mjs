import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor } from "../../tools/mq.mjs";

const { scheduleIn } = await load(import.meta.url, "P26.5-E60.ts");

test("150ms מגיעה לפני 600ms, כל אחת בזמן שלה", async (t) => {
  const r = await rabbitSandbox(t);
  const target = r.queue("target");
  const waitPrefix = r.queue("wait");
  t.after(async () => { for (const d of [150, 600]) await r.admin.deleteQueue(`${waitPrefix}.${d}`).catch(() => {}); });
  await r.admin.assertQueue(target, { durable: true });
  const got = [];
  const start = Date.now();
  await r.admin.consume(target, (m) => { got.push({ body: JSON.parse(m.content.toString()), at: Date.now() - start }); r.admin.ack(m); });
  const ch = await r.channel();
  assert.equal(await scheduleIn(ch, { waitPrefix, target }, { remind: "slow" }, 600), `${waitPrefix}.600`);
  assert.equal(await scheduleIn(ch, { waitPrefix, target }, { remind: "fast" }, 150), `${waitPrefix}.150`);
  await scheduleIn(ch, { waitPrefix, target }, { remind: "fast2" }, 150);
  await waitFor(() => got.length === 3, { timeout: 5000 });
  assert.deepEqual(got.map((g) => g.body.remind), ["fast", "fast2", "slow"], "ההשהיה הקצרה לא נתקעת מאחורי הארוכה");
  assert.ok(got[0].at >= 120 && got[0].at < 550, `fast הגיעה אחרי ${got[0].at}ms`);
  assert.ok(got[2].at >= 550, `slow הגיעה אחרי ${got[2].at}ms`);
  const info = await r.admin.checkQueue(`${waitPrefix}.600`);
  assert.equal(info.messageCount, 0);
});
