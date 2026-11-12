import { test } from "node:test";
import assert from "node:assert/strict";
import { PutObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { moveObject } = await load(import.meta.url, "P26.3-E52.ts");
const keys = async (s3, Bucket) => ((await s3.send(new ListObjectsV2Command({ Bucket }))).Contents ?? []).map((o) => o.Key).sort();

test("מעביר, שומר תוכן ו־ContentType — גם עם עברית ורווחים", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const from = "receipts/קבלה מספר 7.pdf";
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: from, Body: "%PDF-1.7 קבלה", ContentType: "application/pdf" }));
  assert.equal(await moveObject(s3, bucket, from, "archive/2026/7.pdf"), true);
  assert.deepEqual(await keys(s3, bucket), ["archive/2026/7.pdf"]);
  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: "archive/2026/7.pdf" }));
  assert.equal(await obj.Body.transformToString(), "%PDF-1.7 קבלה");
  assert.equal(obj.ContentType, "application/pdf");
});
test("לא קיים ← false; אותו מפתח ← true בלי למחוק; דורס יעד קיים", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  assert.equal(await moveObject(s3, bucket, "nope.txt", "x.txt"), false);
  assert.deepEqual(await keys(s3, bucket), []);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: "a.txt", Body: "A" }));
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: "b.txt", Body: "B" }));
  assert.equal(await moveObject(s3, bucket, "a.txt", "a.txt"), true);
  await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: "a.txt" }));
  assert.equal(await moveObject(s3, bucket, "a.txt", "b.txt"), true);
  assert.deepEqual(await keys(s3, bucket), ["b.txt"]);
  assert.equal(await (await s3.send(new GetObjectCommand({ Bucket: bucket, Key: "b.txt" }))).Body.transformToString(), "A");
});
test("שגיאה אחרת — נזרקת", async (t) => {
  const { s3 } = await bucketSandbox(t);
  await assert.rejects(moveObject(s3, "no-such-bucket-" + process.pid, "a", "b"));
});
