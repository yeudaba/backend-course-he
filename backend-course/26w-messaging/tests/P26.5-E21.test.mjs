import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";
import { sleep } from "../../tools/mq.mjs";

const { processInvoices } = await load(import.meta.url, "P26.5-E21.ts");
const put = (sqs, queueUrl, id) => sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ id }) }));

test("באג 1: כישלון ← ההודעה לא נמחקת, וחוזרת", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t, { attributes: { VisibilityTimeout: "1" } });
  await put(sqs, queueUrl, 1);
  await processInvoices(sqs, queueUrl, async () => {
    throw new Error("PDF service down");
  });
  await sleep(1300);
  const r = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, WaitTimeSeconds: 1 }));
  assert.equal(r.Messages?.length, 1, "החשבונית אבדה — נמחקה לפני שהופקה");
});
test("באג 2: כל הודעה נמחקת עם ה־ReceiptHandle שלה", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t, { attributes: { VisibilityTimeout: "1" } });
  for (const id of [1, 2, 3]) await put(sqs, queueUrl, id);
  const issued = [];
  for (let i = 0; i < 4 && issued.length < 3; i++) await processInvoices(sqs, queueUrl, async (inv) => void issued.push(inv.id));
  await sleep(1300);
  const r = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 1 }));
  assert.equal(r.Messages?.length ?? 0, 0, "הודעות שטופלו חזרו — לא נמחקו (נמחקה רק אחת, כמה פעמים)");
});
test("באג 3: long polling", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  const calls = [];
  const orig = sqs.send.bind(sqs);
  sqs.send = (cmd) => (calls.push(cmd), orig(cmd));
  setTimeout(() => put({ send: orig }, queueUrl, 9), 500);
  const n = await processInvoices(sqs, queueUrl, async () => {});
  const recv = calls.find((c) => c.constructor.name === "ReceiveMessageCommand");
  assert.ok(recv.input.WaitTimeSeconds >= 1, "WaitTimeSeconds 0 ← לולאה שמבזבזת קריאות (ומשלמים על כל אחת)");
  assert.equal(n, 1);
});
