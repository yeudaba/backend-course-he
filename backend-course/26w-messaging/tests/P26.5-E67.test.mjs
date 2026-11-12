import { test } from "node:test";
import assert from "node:assert/strict";
import { SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";
import { sleep } from "../../tools/mq.mjs";

const { withVisibilityHeartbeat } = await load(import.meta.url, "P26.5-E67.ts");

test("עבודה ארוכה מה־timeout — ההודעה לא חוזרת באמצע", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t, { attributes: { VisibilityTimeout: "2" } });
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: "invoice-7" }));
  const [m] = (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, WaitTimeSeconds: 1 }))).Messages;
  let stolen = null;
  const probe = (async () => {
    await sleep(2600);
    stolen = (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, WaitTimeSeconds: 0 }))).Messages ?? [];
  })();
  const r = await withVisibilityHeartbeat(sqs, queueUrl, m.ReceiptHandle, async () => { await sleep(3500); return "done"; }, { visibilitySeconds: 2, everyMs: 700 });
  await probe;
  assert.equal(r, "done");
  assert.deepEqual(stolen, [], "consumer אחר קיבל את ההודעה באמצע העבודה — ה־heartbeat לא עבד");
  await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle }));
});
test("שגיאה עולה, וה־heartbeat נעצר", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  let calls = 0;
  const spy = { send: async (cmd) => { calls++; return sqs.send(cmd); } };
  await assert.rejects(withVisibilityHeartbeat(spy, queueUrl, "bogus-handle", async () => { await sleep(250); throw new Error("pdf failed"); }, { visibilitySeconds: 5, everyMs: 50 }), { message: "pdf failed" });
  const after = calls;
  assert.ok(after >= 2, `heartbeat נשלח ${after} פעמים`);
  await sleep(200);
  assert.equal(calls, after, "אחרי הסוף — אין יותר heartbeats");
});
