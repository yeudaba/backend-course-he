import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageBatchCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";

const { redrive } = await load(import.meta.url, "P26.5-E69.ts");
const depth = async (sqs, QueueUrl) => Number((await sqs.send(new GetQueueAttributesCommand({ QueueUrl, AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible"] }))).Attributes.ApproximateNumberOfMessages);

async function setup(t, n) {
  const dlq = await queueSandbox(t);
  const main = await queueSandbox(t);
  for (let i = 0; i < n; i += 10) {
    await dlq.sqs.send(new SendMessageBatchCommand({ QueueUrl: dlq.queueUrl, Entries: Array.from({ length: Math.min(10, n - i) }, (_, k) => ({ Id: `e${k}`, MessageBody: JSON.stringify({ n: i + k }) })) }));
  }
  return { sqs: dlq.sqs, dlq: dlq.queueUrl, main: main.queueUrl };
}

test("max — מעביר בדיוק כמה שביקשו", async (t) => {
  const { sqs, dlq, main } = await setup(t, 15);
  assert.equal(await redrive(sqs, dlq, main, 12), 12);
  assert.equal(await depth(sqs, main), 12);
  assert.equal(await depth(sqs, dlq), 3, "לא יותר מ־max יצאו מה־DLQ");
});
test("בלי max — הכול, והתור הריק מסיים", async (t) => {
  const { sqs, dlq, main } = await setup(t, 7);
  assert.equal(await redrive(sqs, dlq, main), 7);
  assert.equal(await depth(sqs, main), 7);
  assert.equal(await depth(sqs, dlq), 0);
  assert.equal(await redrive(sqs, dlq, main), 0);
});
