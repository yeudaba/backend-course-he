import { test } from "node:test";
import assert from "node:assert/strict";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { receiptLink } = await load(import.meta.url, "P26.3-E56.ts");
const owners = { 7: 1, 8: 2, 9: 1 };
const ownerOf = async (id) => owners[id] ?? null;

test("הבעלים מקבל כתובת שמורידה את הקובץ, עם שם להורדה", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: "receipts/7.pdf", Body: "%PDF-1.7 order 7", ContentType: "application/pdf" }));
  const r = await receiptLink(s3, bucket, { userId: 1, orderId: 7, ownerOf });
  assert.equal(r.status, 200);
  const u = new URL(r.url);
  assert.ok(u.pathname.endsWith("/receipts/7.pdf"), u.pathname);
  assert.equal(u.searchParams.get("X-Amz-Expires"), "60", "תוקף של 60 שניות");
  const res = await fetch(r.url);
  assert.equal(res.status, 200);
  assert.equal(await res.text(), "%PDF-1.7 order 7");
  assert.equal(res.headers.get("content-disposition"), 'attachment; filename="receipt-7.pdf"');
});
test("לא הבעלים, הזמנה שלא קיימת, או בלי קבלה ← 404", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: "receipts/8.pdf", Body: "x" }));
  assert.deepEqual(await receiptLink(s3, bucket, { userId: 1, orderId: 8, ownerOf }), { status: 404 }, "של משתמש אחר");
  assert.deepEqual(await receiptLink(s3, bucket, { userId: 1, orderId: 99, ownerOf }), { status: 404 });
  assert.deepEqual(await receiptLink(s3, bucket, { userId: 1, orderId: 9, ownerOf }), { status: 404 }, "אין קובץ");
});
