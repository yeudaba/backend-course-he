import { test } from "node:test";
import assert from "node:assert/strict";
import { ReceiveMessageCommand } from "@aws-sdk/client-sqs";
import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { queueSandbox, bucketSandbox } from "../../tools/aws.mjs";

const { sendClaimCheck, readClaimCheck } = await load(import.meta.url, "P26.5-E74.ts");

test("קטן — inline; גדול (בבתים) — דרך S3", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  const { s3, bucket } = await bucketSandbox(t);
  const small = { orderId: 7, lines: ["a"] };
  const hebrew = { note: "ק".repeat(60) }; // 60 תווים, ~120 בתים
  assert.equal(await sendClaimCheck({ s3, sqs }, { bucket, queueUrl }, small, 100), "inline");
  assert.equal(await sendClaimCheck({ s3, sqs }, { bucket, queueUrl }, hebrew, 100), "s3", "גודל בבתים, לא בתווים");
  const keys = ((await s3.send(new ListObjectsV2Command({ Bucket: bucket }))).Contents ?? []).map((o) => o.Key);
  assert.equal(keys.length, 1);
  assert.match(keys[0], /^claims\/[0-9a-f-]{36}\.json$/);
  const got = [];
  for (let k = 0; k < 3 && got.length < 2; k++) {
    for (const m of (await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, VisibilityTimeout: 30 }))).Messages ?? []) got.push(m.Body);
  }
  const bodies = got.map((b) => JSON.parse(b));
  assert.ok(bodies.some((b) => JSON.stringify(b) === JSON.stringify({ inline: small })));
  assert.ok(bodies.some((b) => b.s3Key === keys[0] && !("inline" in b)));
  const payloads = await Promise.all(got.map((b) => readClaimCheck(s3, bucket, b)));
  assert.deepEqual(payloads.sort((a, b) => JSON.stringify(a).length - JSON.stringify(b).length), [small, hebrew]);
});
test("ברירת מחדל 200,000", async (t) => {
  const { sqs, queueUrl } = await queueSandbox(t);
  const { s3, bucket } = await bucketSandbox(t);
  assert.equal(await sendClaimCheck({ s3, sqs }, { bucket, queueUrl }, { x: "a".repeat(199_000) }), "inline");
  assert.equal(await sendClaimCheck({ s3, sqs }, { bucket, queueUrl }, { x: "a".repeat(200_000) }), "s3");
});
