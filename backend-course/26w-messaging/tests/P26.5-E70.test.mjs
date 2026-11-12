import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";

const { queueDepth, workersNeeded } = await load(import.meta.url, "P26.5-E70.ts");

test("queueDepth", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  for (let i = 0; i < 5; i++) await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: String(i) }));
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: "later", DelaySeconds: 60 }));
  await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 2, VisibilityTimeout: 60 }));
  assert.deepEqual(await queueDepth(sqs, queueUrl), { visible: 3, inFlight: 2, delayed: 1 });
});
test("workersNeeded", () => {
  assert.equal(workersNeeded({ visible: 950, inFlight: 50 }, { perWorker: 100, min: 1, max: 20 }), 10);
  assert.equal(workersNeeded({ visible: 1, inFlight: 0 }, { perWorker: 100, min: 2, max: 20 }), 2);
  assert.equal(workersNeeded({ visible: 50_000, inFlight: 0 }, { perWorker: 100, min: 1, max: 20 }), 20);
  assert.equal(workersNeeded({ visible: 0, inFlight: 0 }, { perWorker: 100, min: 0, max: 5 }), 0);
  assert.equal(workersNeeded({ visible: 101, inFlight: 0 }, { perWorker: 100, min: 0, max: 5 }), 2);
});
