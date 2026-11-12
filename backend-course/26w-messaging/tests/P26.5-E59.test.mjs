import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen } from "../../tools/load.mjs";
import { rabbitSandbox, waitFor } from "../../tools/mq.mjs";

const { eventsApp } = await load(import.meta.url, "P26.5-E59.ts");

async function setup(t) {
  const r = await rabbitSandbox(t);
  const exchange = r.exchange("orders"), q = r.queue("all");
  await r.admin.assertExchange(exchange, "topic", { durable: true });
  await r.admin.assertQueue(q, { durable: true });
  await r.admin.bindQueue(q, exchange, "order.#");
  const { base, close } = await listen(eventsApp(await r.channel(), exchange));
  t.after(close);
  const post = (b) => fetch(base + "/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
  return { r, q, post };
}

test("מפרסם עם routing key, persistent ו־messageId", async (t) => {
  const { r, q, post } = await setup(t);
  const e = { id: "ev-1", type: "paid", orderId: 7, country: "IL" };
  const res = await post(e);
  assert.equal(res.status, 202);
  assert.deepEqual(await res.json(), { routingKey: "order.paid.il" });
  await waitFor(async () => (await r.depth(q)) === 1);
  const [m] = await r.drain(q);
  assert.equal(m.routingKey, "order.paid.il");
  assert.deepEqual(JSON.parse(m.body), e);
  assert.equal(m.properties.deliveryMode, 2);
  assert.equal(m.properties.contentType, "application/json");
  assert.equal(m.properties.messageId, "ev-1");
});
test("לא תקין ← 400 ושום דבר לא נשלח", async (t) => {
  const { r, q, post } = await setup(t);
  for (const b of [{ id: "", type: "paid", orderId: 1, country: "IL" }, { id: "x", type: "#", orderId: 1, country: "IL" }, { id: "x", type: "paid", orderId: 0, country: "IL" }, { id: "x", type: "paid", orderId: 1, country: "ISR" }, {}]) {
    const res = await post(b);
    assert.equal(res.status, 400, JSON.stringify(b));
  }
  await new Promise((r) => setTimeout(r, 150));
  assert.equal(await r.depth(q), 0);
});
