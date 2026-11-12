import { test } from "node:test";
import assert from "node:assert/strict";
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { load } from "../../tools/load.mjs";
import { queueSandbox } from "../../tools/aws.mjs";

const { sendAll } = await load(import.meta.url, "P26.5-E68.ts");

test("23 הודעות ב־3 בקשות, ואחת שנכשלה מדווחת", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  let calls = 0;
  const spy = { send: (cmd) => { calls++; return sqs.send(cmd); } };
  const msgs = Array.from({ length: 23 }, (_, i) => ({ id: `m${i}`, body: { i } }));
  msgs[12] = { id: "m12", body: "bad\uFFFFchar" };
  const r = await sendAll(spy, queueUrl, msgs);
  assert.equal(calls, 3);
  assert.deepEqual(r.failed, [{ id: "m12", code: "InvalidMessageContents" }]);
  assert.deepEqual(r.sent, msgs.filter((m) => m.id !== "m12").map((m) => m.id));
  const seen = new Set();
  for (let k = 0; k < 6 && seen.size < 22; k++) {
    for (const m of (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, VisibilityTimeout: 30 }))).Messages ?? []) seen.add(JSON.parse(m.Body).i);
  }
  assert.equal(seen.size, 22, "הגוף — JSON של body");
});
test("בלי הודעות — בלי קריאות", async () => {
  let calls = 0;
  assert.deepEqual(await sendAll({ send: async () => { calls++; } }, "x", []), { sent: [], failed: [] });
  assert.equal(calls, 0);
});
