import { test } from "node:test";
import assert from "node:assert/strict";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { listAllKeys, deletePrefix } = await load(import.meta.url, "P25.5-E19.ts");

async function seed(s3, bucket) {
  const keys = [];
  for (let i = 1; i <= 23; i++) keys.push(`uploads/42/${String(i).padStart(2, "0")}.png`);
  keys.push("uploads/7/a.png", "uploads/42-old/x.png", "reports/r.json");
  await Promise.all(keys.map((Key) => s3.send(new PutObjectCommand({ Bucket: bucket, Key, Body: "x" }))));
}

test("listAllKeys עובר על כל הדפים", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await seed(s3, bucket);
  const keys = await listAllKeys(s3, bucket, "uploads/42/", 10);
  assert.equal(keys.length, 23, "23 מפתחות בשלושה דפים של 10 — ContinuationToken");
  assert.equal(keys[0], "uploads/42/01.png");
  assert.equal(keys.at(-1), "uploads/42/23.png");
  assert.equal((await listAllKeys(s3, bucket, "uploads/", 5)).length, 25);
});
test("deletePrefix מוחק רק את התיקייה, ומחזיר כמה", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await seed(s3, bucket);
  assert.equal(await deletePrefix(s3, bucket, "uploads/42/"), 23);
  const left = (await s3.send(new ListObjectsV2Command({ Bucket: bucket }))).Contents.map((o) => o.Key).sort();
  assert.deepEqual(left, ["reports/r.json", "uploads/42-old/x.png", "uploads/7/a.png"], "uploads/42-old לא נמחק — prefix הוא מחרוזת, לא תיקייה");
  assert.equal(await deletePrefix(s3, bucket, "uploads/42/"), 0, "פעם שנייה — 0, בלי שגיאה");
});
test("prefix ריק או בלי / ← שגיאה (בלי למחוק כלום)", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await seed(s3, bucket);
  await assert.rejects(deletePrefix(s3, bucket, ""));
  await assert.rejects(deletePrefix(s3, bucket, "uploads/42"));
  assert.equal((await listAllKeys(s3, bucket, "")).length, 26);
});
