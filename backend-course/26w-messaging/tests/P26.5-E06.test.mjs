import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";
import { rabbitSandbox } from "../../tools/mq.mjs";

const { setupTopology, publishOrderEvent } = await load(import.meta.url, "P26.5-E06.ts");
const ev = (n, type, country) => ({ id: `ev-${n}`, type, orderId: n, country });

test("emails מקבל created ו־shipped; analytics — הכול", async (t) => {
  const r = await rabbitSandbox(t);
  const names = { exchange: r.exchange("orders"), emailQueue: r.queue("emails"), analyticsQueue: r.queue("analytics") };
  const ch = await r.channel();
  await setupTopology(ch, names);
  const events = [ev(1, "created", "IL"), ev(2, "paid", "IL"), ev(3, "shipped", "US"), ev(4, "cancelled", "IL"), ev(5, "created", "DE")];
  for (const e of events) publishOrderEvent(ch, names.exchange, e);
  await ch.close(); // מחכה שהכול נשלח
  const emails = await r.drain(names.emailQueue);
  const analytics = await r.drain(names.analyticsQueue);
  assert.deepEqual(emails.map((m) => m.routingKey), ["order.created.il", "order.shipped.us", "order.created.de"]);
  assert.equal(analytics.length, 5);
  assert.deepEqual(JSON.parse(emails[0].body), events[0]);
});
test("הודעה עמידה (persistent), JSON, עם messageId", async (t) => {
  const r = await rabbitSandbox(t);
  const names = { exchange: r.exchange("orders"), emailQueue: r.queue("emails"), analyticsQueue: r.queue("analytics") };
  const ch = await r.channel();
  await setupTopology(ch, names);
  publishOrderEvent(ch, names.exchange, ev(9, "created", "IL"));
  await ch.close();
  const [m] = await r.drain(names.emailQueue);
  assert.equal(m.properties.deliveryMode, 2, "persistent: true");
  assert.equal(m.properties.contentType, "application/json");
  assert.equal(m.properties.messageId, "ev-9", "messageId — כדי שה־consumer יזהה כפילויות");
});
test("exchange ותורים עמידים (durable)", async (t) => {
  const r = await rabbitSandbox(t);
  const names = { exchange: r.exchange("orders"), emailQueue: r.queue("emails"), analyticsQueue: r.queue("analytics") };
  const ch = await r.channel();
  await setupTopology(ch, names);
  // assert עם אותן הגדרות עובר; עם הגדרות אחרות — RabbitMQ סוגר את הערוץ (PRECONDITION_FAILED)
  const probe = await r.channel();
  await probe.assertExchange(names.exchange, "topic", { durable: true });
  await probe.assertQueue(names.emailQueue, { durable: true });
  await probe.assertQueue(names.analyticsQueue, { durable: true });
});
