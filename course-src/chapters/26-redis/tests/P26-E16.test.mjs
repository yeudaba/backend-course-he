import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";

const { createEmailQueue, startEmailWorker } = await load(import.meta.url, "P26-E16.ts");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function until(fn, ms) {
  for (const end = Date.now() + ms; Date.now() < end; await sleep(50)) if (await fn()) return true;
  return false;
}

test("נשלח, עם retry אחרי כישלון, ופעם אחת למרות הוספה כפולה", async (t) => {
  const sb = await redisSandbox(t);
  const q = createEmailQueue(sb.connection(), sb.bullPrefix);
  let worker;
  t.after(async () => { await worker?.close(); await q.close(); });
  const sent = [];
  let failures = 0;
  worker = startEmailWorker(sb.connection(), sb.bullPrefix, async (email) => {
    if (email.to === "flaky@example.com" && failures < 2) {
      failures++;
      throw new Error("SMTP timeout");
    }
    sent.push(email.to);
  });

  await q.send("order-1", { to: "dana@example.com", subject: "אישור #1" });
  await q.send("order-1", { to: "dana@example.com", subject: "אישור #1" });
  await q.send("order-2", { to: "flaky@example.com", subject: "אישור #2" });
  assert.ok(await until(() => sent.length === 2, 8000), `שני מיילים: ${sent}`);
  await sleep(300);
  assert.deepEqual(sent.sort(), ["dana@example.com", "flaky@example.com"], "order-1 — פעם אחת");
  assert.equal(failures, 2, "flaky נכשל פעמיים, והצליח בניסיון השלישי");
  const job = await q.queue.getJob("order-2");
  assert.ok(job === undefined || job.opts.attempts >= 3, "attempts מוגדר");
});
test("כישלון קבוע — נכשל אחרי attempts, לא לולאה אינסופית", async (t) => {
  const sb = await redisSandbox(t);
  const q = createEmailQueue(sb.connection(), sb.bullPrefix);
  let worker;
  t.after(async () => { await worker?.close(); await q.close(); });
  let tries = 0;
  worker = startEmailWorker(sb.connection(), sb.bullPrefix, async () => { tries++; throw new Error("bad address"); });
  await q.send("bad-1", { to: "x", subject: "y" });
  assert.ok(await until(async () => (await q.queue.getFailedCount()) === 1, 8000), "בסוף — ברשימת failed");
  assert.ok(tries >= 2 && tries <= 10, `ניסה כמה פעמים ועצר (${tries})`);
});
