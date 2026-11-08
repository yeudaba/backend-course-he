import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { kafkaSandbox, deadline } from "../../tools/mq.mjs";
import { sandbox } from "../../tools/sql.mjs";

const { runRevenueAggregator } = await load(import.meta.url, "P26.5-E25.ts");

const events = [
  { orderId: 1, totalCents: 1000, at: "2026-11-08T10:00:05Z" },
  { orderId: 2, totalCents: 2500, at: "2026-11-08T10:00:40Z" },
  { orderId: 3, totalCents: 990, at: "2026-11-08T10:01:10Z" },
  { orderId: 4, totalCents: 4000, at: "2026-11-08T10:01:59Z" },
  { orderId: 5, totalCents: 1500, at: "2026-11-08T10:02:00Z" },
  { orderId: 6, totalCents: 700, at: "2026-11-08T10:00:59Z" },
];
const expected = [
  { minute: "2026-11-08T10:00:00.000Z", orders: 3, revenue_cents: 4200 },
  { minute: "2026-11-08T10:01:00.000Z", orders: 2, revenue_cents: 4990 },
  { minute: "2026-11-08T10:02:00.000Z", orders: 1, revenue_cents: 1500 },
];

async function setup(t) {
  const db = await sandbox(t, import.meta.url, "events.sql");
  const k = await kafkaSandbox(t, { partitions: 3 });
  const topic = await k.topic("paid");
  await k.producer().send({ messages: events.map((e) => ({ topic, key: String(e.orderId), value: JSON.stringify(e) })) });
  const pool = db.pool(3);
  return { db, k, topic, pool };
}
const totals = async (db) =>
  (await db.rows("SELECT minute, orders, revenue_cents FROM revenue_by_minute ORDER BY minute")).map((r) => ({ ...r, minute: r.minute.toISOString() }));

// pool שה־COMMIT מספר n שלו נכשל — "התהליך נפל באמצע"
function crashingPool(pool, failAt) {
  let commits = 0;
  const wrapped = new WeakSet(); // ה־pool מחזיר את אותו client שוב — לעטוף פעם אחת
  return {
    query: (...a) => pool.query(...a),
    async connect() {
      const c = await pool.connect();
      if (wrapped.has(c)) return c;
      wrapped.add(c);
      const q = c.query.bind(c);
      c.query = (text, ...rest) => {
        if (typeof text === "string" && /^\s*COMMIT\b/i.test(text) && ++commits === failAt) return Promise.reject(new Error("crash"));
        return q(text, ...rest);
      };
      return c;
    },
  };
}

test("אגרגציה לפי דקה, וה־offsets נשמרים במסד", async (t) => {
  const { db, k, topic, pool } = await setup(t);
  assert.equal(await deadline(runRevenueAggregator({ brokers: k.brokers, topic, pool, max: 6 }), 10000, "runRevenueAggregator לא חזר — מחכה להודעות שכבר עובדו, או שלא מתחיל מה־offsets שבמסד?"), 6);
  assert.deepEqual(await totals(db), expected);
  const offs = await db.rows("SELECT partition, next_offset FROM consumer_offsets WHERE topic = $1 ORDER BY partition", [topic]);
  assert.equal(offs.reduce((s, r) => s + Number(r.next_offset), 0), 6, "סכום ה־next_offset = מספר ההודעות");
});
test("ריצה בשני חלקים ← אותה תוצאה, בלי לספור פעמיים", async (t) => {
  const { db, k, topic, pool } = await setup(t);
  await deadline(runRevenueAggregator({ brokers: k.brokers, topic, pool, max: 4 }), 10000, "runRevenueAggregator לא חזר — מחכה להודעות שכבר עובדו, או שלא מתחיל מה־offsets שבמסד?");
  await deadline(runRevenueAggregator({ brokers: k.brokers, topic, pool, max: 2 }), 10000, "runRevenueAggregator לא חזר — מחכה להודעות שכבר עובדו, או שלא מתחיל מה־offsets שבמסד?");
  assert.deepEqual(await totals(db), expected);
});
for (const failAt of [2, 3]) {
  test(`קריסה ב־COMMIT מספר ${failAt} ← אחרי הפעלה מחדש, כל אירוע נספר בדיוק פעם אחת`, async (t) => {
    const { db, k, topic, pool } = await setup(t);
    await assert.rejects(runRevenueAggregator({ brokers: k.brokers, topic, pool: crashingPool(pool, failAt), max: 6 }), /crash/);
    await deadline(runRevenueAggregator({ brokers: k.brokers, topic, pool, max: 7 - failAt }), 10000, "runRevenueAggregator לא חזר — מחכה להודעות שכבר עובדו, או שלא מתחיל מה־offsets שבמסד?");
    assert.deepEqual(await totals(db), expected, "התוצאה וה־offset חייבים להישמר באותה טרנזקציה");
  });
}
