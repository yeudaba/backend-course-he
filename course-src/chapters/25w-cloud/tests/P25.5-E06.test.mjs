import { test } from "node:test";
import assert from "node:assert/strict";
import { HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { putJson, getJson } = await load(import.meta.url, "P25.5-E06.ts");

test("putJson ואז getJson מחזיר את אותו ערך — כולל עברית", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const value = { id: 7, name: "קפה קולומביאני", tags: ["beans", "☕"], price: 89.9 };
  await putJson(s3, bucket, "products/7.json", value);
  assert.deepEqual(await getJson(s3, bucket, "products/7.json"), value);
});
test("נשמר כ־JSON אמיתי, עם Content-Type של JSON", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await putJson(s3, bucket, "a.json", { ok: true });
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: "a.json" }));
  assert.match(head.ContentType ?? "", /^application\/json/, "ContentType — אחרת דפדפן/CDN יגישו אותו כקובץ בינארי");
  const raw = await (await s3.send(new GetObjectCommand({ Bucket: bucket, Key: "a.json" }))).Body.transformToString();
  assert.equal(raw, '{"ok":true}');
});
test("מפתח שלא קיים ← null", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  assert.equal(await getJson(s3, bucket, "nope.json"), null);
});
test("שגיאה אחרת (bucket שלא קיים) — נזרקת, לא null", async (t) => {
  const { s3 } = await bucketSandbox(t);
  await assert.rejects(getJson(s3, "no-such-bucket-" + process.pid, "a.json"), "רק NoSuchKey הוא 'אין'; bucket שגוי או הרשאות — באג שצריך לראות");
});
