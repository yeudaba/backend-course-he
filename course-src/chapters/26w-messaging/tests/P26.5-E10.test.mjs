import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";
import { sleep } from "../../tools/mq.mjs";

const { pollOnce } = await load(import.meta.url, "P26.5-E10.ts");

test("מטפל, ומוחק רק את מה שהצליח", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t, { attributes: { VisibilityTimeout: "1" } });
  for (let i = 1; i <= 5; i++) await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ id: i }) }));
  const seen = [];
  let total = { handled: 0, failed: 0 };
  for (let i = 0; i < 3 && total.handled + total.failed < 5; i++) {
    const r = await pollOnce(sqs, queueUrl, async (b) => {
      seen.push(b.id);
      if (b.id === 4) throw new Error("bad");
    }, { waitSeconds: 1 });
    total = { handled: total.handled + r.handled, failed: total.failed + r.failed };
  }
  assert.deepEqual(total, { handled: 4, failed: 1 });
  await sleep(1300); // visibility timeout
  const again = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 1 }));
  assert.deepEqual((again.Messages ?? []).map((m) => JSON.parse(m.Body).id), [4], "רק זו שנכשלה חזרה; השאר נמחקו");
});
test("long polling: מחכה להודעה במקום לחזור ריק", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  const calls = [];
  const orig = sqs.send.bind(sqs);
  sqs.send = (cmd) => (calls.push(cmd), orig(cmd));
  setTimeout(() => orig(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: '{"late":true}' })), 700);
  const got = [];
  const r = await pollOnce(sqs, queueUrl, async (b) => void got.push(b), { waitSeconds: 3 });
  assert.equal(r.handled, 1, "קריאה אחת עם WaitTimeSeconds — מחכה להודעה שמגיעה אחרי 0.7 שניות");
  const recv = calls.find((c) => c.constructor.name === "ReceiveMessageCommand");
  assert.equal(recv.input.WaitTimeSeconds, 3);
  assert.equal(recv.input.MaxNumberOfMessages, 10);
});
test("תור ריק ← 0/0, בלי שגיאה", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  assert.deepEqual(await pollOnce(sqs, queueUrl, async () => {}, { waitSeconds: 1 }), { handled: 0, failed: 0 });
});
