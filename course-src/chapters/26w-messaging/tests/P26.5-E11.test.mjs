import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, ReceiveMessageCommand, GetQueueAttributesCommand, DeleteQueueCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { sqsClient } from "../../tools/aws.mjs";
import { sleep } from "../../tools/mq.mjs";

const { createQueueWithDlq } = await load(import.meta.url, "P26.5-E11.ts");

async function make(t, opts) {
  const sqs = sqsClient();
  const name = `chk-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  const res = await createQueueWithDlq(sqs, name, opts);
  t.after(async () => {
    for (const u of [res.queueUrl, res.dlqUrl]) await sqs.send(new DeleteQueueCommand({ QueueUrl: u })).catch(() => {});
    sqs.destroy();
  });
  return { sqs, name, ...res };
}

test("RedrivePolicy מצביע על ה־DLQ, עם maxReceiveCount", async (t) => {
  const { sqs, queueUrl, dlqUrl, name } = await make(t, { maxReceiveCount: 4, visibilityTimeout: 45 });
  assert.match(dlqUrl, new RegExp(`${name}-dlq$`));
  const dlqArn = (await sqs.send(new GetQueueAttributesCommand({ QueueUrl: dlqUrl, AttributeNames: ["QueueArn"] }))).Attributes.QueueArn;
  const a = (await sqs.send(new GetQueueAttributesCommand({ QueueUrl: queueUrl, AttributeNames: ["All"] }))).Attributes;
  assert.deepEqual(JSON.parse(a.RedrivePolicy), { deadLetterTargetArn: dlqArn, maxReceiveCount: 4 });
  assert.equal(a.VisibilityTimeout, "45");
});
test("הודעה שלא נמחקת maxReceiveCount פעמים ← עוברת ל־DLQ", async (t) => {
  const { sqs, queueUrl, dlqUrl } = await make(t, { maxReceiveCount: 2, visibilityTimeout: 1 });
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: '{"poison":true}' }));
  for (let i = 0; i < 2; i++) {
    const r = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, WaitTimeSeconds: 2 }));
    assert.equal(r.Messages?.length, 1, `קבלה ${i + 1}`);
    await sleep(1200); // לא מוחקים — "ה־consumer נפל"
  }
  const r3 = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, WaitTimeSeconds: 1 }));
  assert.equal(r3.Messages?.length ?? 0, 0, "אחרי 2 קבלות — כבר לא בתור הראשי");
  const d = await sqs.send(new ReceiveMessageCommand({ QueueUrl: dlqUrl, WaitTimeSeconds: 2 }));
  assert.equal(d.Messages?.[0]?.Body, '{"poison":true}');
});
