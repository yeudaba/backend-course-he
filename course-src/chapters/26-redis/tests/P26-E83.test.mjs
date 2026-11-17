import { test } from "node:test";
import assert from "node:assert/strict";
import { Queue } from "bullmq";
import { load } from "../../tools/load.mjs";
import { redisSandbox } from "../../tools/redis.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { relayOutbox } = await load(import.meta.url, "P26-E83.ts");

async function setup(t) {
  const db = await sandbox(t, import.meta.url);
  await db.query("CREATE TABLE outbox (id serial PRIMARY KEY, kind text NOT NULL, payload jsonb NOT NULL, sent_at timestamptz)");
  const sb = await redisSandbox(t);
  const queue = new Queue("outbox", { connection: sb.connection(), prefix: sb.bullPrefix });
  t.after(async () => { await queue.obliterate({ force: true }).catch(() => {}); await queue.close(); });
  return { db, queue };
}

test("מעביר שורות שלא נשלחו, לפי הסדר, ומסמן", async (t) => {
  const { db, queue } = await setup(t);
  await db.query(`INSERT INTO outbox (kind, payload, sent_at) VALUES
    ('order-confirmation', '{"orderId":7}', NULL),
    ('order-confirmation', '{"orderId":8}', now()),
    ('invoice', '{"orderId":9,"lines":[1,2]}', NULL),
    ('order-confirmation', '{"orderId":10}', NULL)`);
  assert.equal(await relayOutbox(db.client, queue), 3);
  const jobs = (await queue.getWaiting(0, -1)).sort((a, b) => Number(a.id.split("-")[1]) - Number(b.id.split("-")[1]));
  assert.deepEqual(jobs.map((j) => [j.id, j.name, j.data]), [
    ["outbox-1", "order-confirmation", { orderId: 7 }],
    ["outbox-3", "invoice", { orderId: 9, lines: [1, 2] }],
    ["outbox-4", "order-confirmation", { orderId: 10 }],
  ]);
  assert.deepEqual(await db.rows("SELECT id FROM outbox WHERE sent_at IS NULL"), [], "כולן מסומנות");
  assert.equal(await relayOutbox(db.client, queue), 0, "ריצה שנייה — כלום");
});
test("limit, וקריסה לפני הסימון לא יוצרת עבודה כפולה", async (t) => {
  const { db, queue } = await setup(t);
  for (let i = 1; i <= 5; i++) await db.query("INSERT INTO outbox (kind, payload) VALUES ('k', $1)", [JSON.stringify({ i })]);
  assert.equal(await relayOutbox(db.client, queue, 2), 2);
  assert.deepEqual((await db.rows("SELECT id FROM outbox WHERE sent_at IS NULL ORDER BY id")).map((r) => r.id), [3, 4, 5], "לפי id");
  await db.query("UPDATE outbox SET sent_at = NULL WHERE id = 2"); // "קרס אחרי add ולפני הסימון"
  assert.equal(await relayOutbox(db.client, queue), 4);
  assert.equal(await queue.getWaitingCount(), 5, "jobId קבוע — שורה 2 לא נוספה פעמיים");
});
