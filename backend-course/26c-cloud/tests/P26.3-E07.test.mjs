import { test } from "node:test";
import assert from "node:assert/strict";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { createUploadUrl, safeName } = await load(import.meta.url, "P26.3-E07.ts");
const req = { userId: 42, filename: "receipt.pdf", contentType: "application/pdf", size: 5 };

test("כתובת חתומה: הלקוח מעלה ישירות ל־S3, והקובץ שם", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const r = await createUploadUrl(s3, bucket, req);
  assert.equal(r.expiresIn, 300);
  assert.match(r.key, /^uploads\/42\/[0-9a-f-]{36}-receipt\.pdf$/, "uploads/<userId>/<uuid>-<שם>");
  const url = new URL(r.url);
  assert.ok(url.searchParams.get("X-Amz-Signature"), "כתובת חתומה (X-Amz-Signature)");
  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  const res = await fetch(r.url, { method: "PUT", body: "%PDF-", headers: { "content-type": "application/pdf" } });
  assert.equal(res.status, 200, `העלאה נכשלה: ${res.status} ${await res.text()}`);
  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: r.key }));
  assert.equal(await obj.Body.transformToString(), "%PDF-");
  assert.equal(obj.ContentType, "application/pdf");
});
test("שני קבצים באותו שם — שני מפתחות שונים", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const a = await createUploadUrl(s3, bucket, req);
  const b = await createUploadUrl(s3, bucket, req);
  assert.notEqual(a.key, b.key, "אחרת משתמש אחד דורס קובץ של עצמו (או של אחר)");
});
test("סוג או גודל לא מותרים ← שגיאה, בלי כתובת", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await assert.rejects(createUploadUrl(s3, bucket, { ...req, contentType: "text/html" }), "HTML שמועלה ל־bucket ציבורי = XSS");
  await assert.rejects(createUploadUrl(s3, bucket, { ...req, size: 6 * 1024 * 1024 }));
  await assert.rejects(createUploadUrl(s3, bucket, { ...req, size: 0 }));
});
test("שם קובץ מסוכן לא בורח מהתיקייה", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const r = await createUploadUrl(s3, bucket, { ...req, filename: "../../admin/x.pdf" });
  assert.match(r.key, /^uploads\/42\/[0-9a-f-]{36}-[^/]+$/);
  assert.ok(!r.key.includes(".."));
  assert.doesNotMatch(safeName("a b<script>.pdf"), /[ <>]/);
});
