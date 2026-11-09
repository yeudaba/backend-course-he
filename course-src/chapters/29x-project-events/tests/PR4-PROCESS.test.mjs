import { test } from "node:test";
import assert from "node:assert/strict";
import { kafkaSandbox, deadline } from "../../tools/mq.mjs";
import { loadP, eventsDb, kafkaEvent } from "./_events.mjs";

// פרויקט 4, שלב 2: ה־processor — Kafka ← MySQL, כל אירוע פעם אחת
const { runProcessor } = await loadP(import.meta.url, "src/processor.ts");

const e1 = kafkaEvent({ eventId: "11111111-1111-4111-8111-111111111111", userId: "u1", ts: "2026-11-05T10:00:00.000Z" });
const batch = [
  e1,
  kafkaEvent({ userId: "u2", ts: "2026-11-05T11:00:00.000Z" }),
  kafkaEvent({ userId: "u1", name: "add_to_cart", ts: "2026-11-05T12:00:00.000Z", props: { productId: 3 } }),
  kafkaEvent({ userId: "u3", ts: "2026-11-05T22:30:00.000Z" }), // 00:30 ב־6.11 בישראל
  kafkaEvent({ userId: "u9", tenantId: "globex", ts: "2026-11-05T10:00:00.000Z" }),
  e1, // כפילות (retry של ה־producer)
];

async function setup(t, messages = batch) {
  const db = await eventsDb(t, import.meta.url);
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("events");
  await k.producer().send({ messages: messages.map((m) => (typeof m === "string" ? { topic, key: "x", value: m } : { topic, key: `${m.tenantId}:${m.userId}`, value: JSON.stringify(m) })) });
  return { db, k, topic, opts: { brokers: k.brokers, topic, groupId: k.groupId(), pool: db.pool() } };
}
const run = (opts, max) => deadline(runProcessor({ ...opts, max }), 15000, "runProcessor לא חזר — מחכה להודעות שכבר עובדו? (COMMITTED + fallback EARLIEST)");
const counts = async (db) => db.rows("SELECT tenant_id, DATE_FORMAT(day, '%Y-%m-%d') AS day, name, events FROM daily_counts ORDER BY tenant_id, day, name");

test("אירועים, ימים בשעון ישראל, ספירות ומשתמשים פעילים — וכפילות נספרת פעם אחת", async (t) => {
  const { db, opts } = await setup(t);
  const s = await run(opts, 6);
  assert.equal(s.processed, 6);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM events"))[0].n, 5);
  assert.deepEqual(await counts(db), [
    { tenant_id: "acme", day: "2026-11-05", name: "add_to_cart", events: 1 },
    { tenant_id: "acme", day: "2026-11-05", name: "page_view", events: 2 },
    { tenant_id: "acme", day: "2026-11-06", name: "page_view", events: 1 },
    { tenant_id: "globex", day: "2026-11-05", name: "page_view", events: 1 },
  ]);
  const users = await db.rows("SELECT tenant_id, DATE_FORMAT(day, '%Y-%m-%d') AS day, COUNT(*) AS n FROM user_days GROUP BY tenant_id, day ORDER BY tenant_id, day");
  assert.deepEqual(users, [{ tenant_id: "acme", day: "2026-11-05", n: 2 }, { tenant_id: "acme", day: "2026-11-06", n: 1 }, { tenant_id: "globex", day: "2026-11-05", n: 1 }]);
  const [row] = await db.rows("SELECT DATE_FORMAT(ts, '%Y-%m-%d %H:%i:%s') AS ts, props FROM events WHERE name = 'add_to_cart'");
  assert.deepEqual(row, { ts: "2026-11-05 12:00:00", props: { productId: 3 } }, "ts נשמר ב־UTC");
});
test("ריצה שנייה ממשיכה מה־commit; הודעה פגומה לא עוצרת", async (t) => {
  const { db, opts } = await setup(t, [...batch.slice(0, 3), "{not json", ...batch.slice(3)]);
  await run(opts, 3);
  await run(opts, 4);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM events"))[0].n, 5);
  assert.equal(Number((await db.rows("SELECT SUM(events) AS n FROM daily_counts"))[0].n), 5);
});
test("קריסה במסד באמצע ← אחרי הפעלה מחדש, אף אירוע לא נספר פעמיים ואף אחד לא חסר", async (t) => {
  const { db, opts } = await setup(t);
  let commits = 0;
  const wrapped = new WeakSet();
  const crashing = {
    async getConnection() {
      const c = await opts.pool.getConnection();
      if (!wrapped.has(c)) {
        wrapped.add(c);
        const commit = c.commit.bind(c);
        c.commit = () => (++commits === 3 ? Promise.reject(new Error("crash")) : commit());
      }
      return c;
    },
    query: (...a) => opts.pool.query(...a),
    execute: (...a) => opts.pool.execute(...a),
  };
  await assert.rejects(runProcessor({ ...opts, pool: crashing, max: 6 }), /crash/);
  await run(opts, 4);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM events"))[0].n, 5);
  assert.equal(Number((await db.rows("SELECT SUM(events) AS n FROM daily_counts"))[0].n), 5, "האגרגציות וה־INSERT באותה טרנזקציה");
});
