import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor, sleep } from "../../tools/mq.mjs";

const { setupOrderPipeline, publishOrderPlaced, startConsumer, memoryStore } = await load(import.meta.url, "P26.5-E24.ts");
const order = (n, extra = {}) => ({ eventId: `evt-${n}`, orderId: n, email: `c${n}@example.com`, items: [{ productId: 1, quantity: n }], ...extra });

async function setup(t) {
  const r = await rabbitSandbox(t);
  const n = { exchange: r.exchange("orders"), emailQueue: r.queue("email"), inventoryQueue: r.queue("inventory"), deadLetterExchange: r.exchange("dlx"), deadLetterQueue: r.queue("dead") };
  const ch = await r.channel();
  await setupOrderPipeline(ch, n);
  const pub = await r.conn.createConfirmChannel();
  return { r, n, ch, pub };
}

test("כל הזמנה מגיעה לשני התורים; publish מחכה לאישור של ה־broker", async (t) => {
  const { r, n, pub } = await setup(t);
  await publishOrderPlaced(pub, n.exchange, order(1));
  // אחרי await — ההודעה כבר בתורים (publisher confirm), בלי לחכות
  assert.equal(await r.depth(n.emailQueue), 1, "publishOrderPlaced חוזר לפני שה־broker אישר?");
  assert.equal(await r.depth(n.inventoryQueue), 1);
  const [m] = await r.drain(n.emailQueue);
  assert.equal(m.properties.messageId, "evt-1");
  assert.equal(m.properties.deliveryMode, 2);
});
test("consumers: כל אחד מטפל בכל הזמנה פעם אחת — גם כשהאירוע נשלח פעמיים", async (t) => {
  const { r, n, ch, pub } = await setup(t);
  const emails = [];
  const reserved = [];
  const store = memoryStore();
  await startConsumer(ch, n.emailQueue, "email", store, async (e) => void emails.push(e.orderId));
  const ch2 = await r.channel();
  await startConsumer(ch2, n.inventoryQueue, "inventory", store, async (e) => void reserved.push(e.orderId));
  for (const o of [order(1), order(2), order(1), order(3)]) await publishOrderPlaced(pub, n.exchange, o);
  await waitFor(async () => emails.length === 3 && reserved.length === 3 && (await r.depth(n.emailQueue)) === 0 && (await r.depth(n.inventoryQueue)) === 0);
  await sleep(150);
  assert.deepEqual(emails.sort(), [1, 2, 3], "מייל אחד לכל הזמנה");
  assert.deepEqual(reserved.sort(), [1, 2, 3], "ה־store משותף — אבל הסימון לפי consumer: email לא 'גונב' מ־inventory");
});
test("הודעה פגומה ← dead letter מיד, בלי לקרוא ל־handler", async (t) => {
  const { r, n, ch, pub } = await setup(t);
  let calls = 0;
  await startConsumer(ch, n.emailQueue, "email", memoryStore(), async () => void calls++);
  await publishOrderPlaced(pub, n.exchange, order(4, { items: [{ productId: 1, quantity: 0 }] }));
  pub.publish(n.exchange, "order.placed", Buffer.from("garbage"));
  await pub.waitForConfirms();
  await waitFor(async () => (await r.depth(n.deadLetterQueue)) >= 2, { message: "ציפינו לשתי הודעות ב־dead letter (מתור email)" });
  assert.equal(calls, 0);
});
test("handler שנכשל ← dead letter, והסימון מתבטל (אפשר לטפל שוב אם יחזור)", async (t) => {
  const { r, n, ch, pub } = await setup(t);
  const store = memoryStore();
  await startConsumer(ch, n.emailQueue, "email", store, async () => {
    throw new Error("smtp down");
  });
  await publishOrderPlaced(pub, n.exchange, order(5));
  await waitFor(async () => (await r.depth(n.deadLetterQueue)) === 1);
  assert.equal(await store.markIfNew("email", "evt-5"), true, "אחרי כישלון — לא מסומן כמטופל");
});
