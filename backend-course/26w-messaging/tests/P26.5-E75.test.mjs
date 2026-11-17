import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";
import { waitFor, sleep } from "../../tools/mq.mjs";

const { startPoller } = await load(import.meta.url, "P26.5-E75.ts");

test("מטפל, מוחק, ונעצר — ואחרי stop לא צורך", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t, { attributes: { VisibilityTimeout: "30" } });
  for (let i = 1; i <= 5; i++) await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ i }) }));
  const seen = [];
  const p = startPoller(sqs, queueUrl, async (b) => { if (b.i === 3) throw new Error("bad"); seen.push(b.i); }, { waitSeconds: 1 });
  let stopped = false;
  t.after(async () => { if (!stopped) await p.stop(); });
  await waitFor(() => p.stats().handled + p.stats().failed === 5);
  assert.deepEqual(seen.sort(), [1, 2, 4, 5]);
  assert.deepEqual(p.stats(), { handled: 4, failed: 1 });
  const start = Date.now();
  await p.stop();
  stopped = true;
  assert.ok(Date.now() - start < 2500, "stop מחכה לכל היותר לסבב אחד");
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ i: 99 }) }));
  await sleep(800);
  assert.ok(!seen.includes(99), "אחרי stop — לא צורכים");
  const a = (await sqs.send(new GetQueueAttributesCommand({ QueueUrl: queueUrl, AttributeNames: ["ApproximateNumberOfMessagesNotVisible"] }))).Attributes;
  assert.equal(a.ApproximateNumberOfMessagesNotVisible, "1", "רק זו שנכשלה מוסתרת — השאר נמחקו");
});
