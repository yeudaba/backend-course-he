import { test } from "node:test";
import assert from "node:assert/strict";
import { ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";

const { sendOrderEvents } = await load(import.meta.url, "P26.5-E09.ts");
const fifo = (t) => queueSandbox(t, { name: `chk-${process.pid}-${Math.random().toString(36).slice(2, 8)}.fifo`, attributes: { FifoQueue: "true" } });

async function receiveAll(sqs, queueUrl) {
  const out = [];
  for (let empty = 0; empty < 2; ) {
    const r = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 1, MessageAttributeNames: ["All"], MessageSystemAttributeNames: ["MessageGroupId"] }));
    if (!r.Messages?.length) {
      empty++;
      continue;
    }
    for (const m of r.Messages) {
      out.push({ body: JSON.parse(m.Body), group: m.Attributes?.MessageGroupId, type: m.MessageAttributes?.type?.StringValue });
      await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle }));
    }
  }
  return out;
}

test("23 אירועים ← 3 batches, כולם הגיעו, עם group ו־type", async (t) => {
  const { sqs, queueUrl } = await fifo(t);
  const events = Array.from({ length: 23 }, (_, i) => ({ eventId: `e${i}`, orderId: (i % 4) + 1, type: i % 2 ? "order.paid" : "order.placed", data: { i } }));
  const calls = [];
  const orig = sqs.send.bind(sqs);
  sqs.send = (cmd) => (calls.push(cmd.constructor.name), orig(cmd));
  assert.equal(await sendOrderEvents(sqs, queueUrl, events), 23);
  sqs.send = orig;
  assert.deepEqual(calls, ["SendMessageBatchCommand", "SendMessageBatchCommand", "SendMessageBatchCommand"], "batches של 10 — לא 23 קריאות");
  const got = await receiveAll(sqs, queueUrl);
  assert.equal(got.length, 23);
  assert.ok(got.every((m) => m.group === String(m.body.orderId)), "MessageGroupId = orderId");
  assert.ok(got.every((m) => m.type === m.body.type), "MessageAttributes.type");
});
test("סדר נשמר בתוך כל הזמנה", async (t) => {
  const { sqs, queueUrl } = await fifo(t);
  const events = Array.from({ length: 12 }, (_, i) => ({ eventId: `s${i}`, orderId: (i % 3) + 1, type: "step", data: { step: i } }));
  await sendOrderEvents(sqs, queueUrl, events);
  const got = await receiveAll(sqs, queueUrl);
  for (const id of [1, 2, 3]) {
    const steps = got.filter((m) => m.body.orderId === id).map((m) => m.body.data.step);
    assert.deepEqual(steps, [...steps].sort((a, b) => a - b), `הזמנה ${id}: ${steps}`);
  }
});
test("אותו eventId פעמיים ← הודעה אחת (deduplication)", async (t) => {
  const { sqs, queueUrl } = await fifo(t);
  const e = { eventId: "dup-1", orderId: 9, type: "order.paid" };
  await sendOrderEvents(sqs, queueUrl, [e]);
  await sendOrderEvents(sqs, queueUrl, [e]); // retry של ה־producer אחרי timeout
  assert.equal((await receiveAll(sqs, queueUrl)).length, 1);
});
