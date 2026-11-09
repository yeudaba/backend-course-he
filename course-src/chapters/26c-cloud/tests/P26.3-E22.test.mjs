import { test } from "node:test";
import assert from "node:assert/strict";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { saveReport, loadReport } = await load(import.meta.url, "P26.3-E22.ts");
const rows = [{ productId: 1, sold: 12 }, { productId: 4, sold: 3 }];

test("באג 1: דוח ששמרנו — חוזר (ולא null)", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await saveReport(s3, bucket, "2026-11-08", rows);
  assert.deepEqual(await loadReport(s3, bucket, "2026-11-08"), rows, "Body הוא stream — String(Body) נותן '[object …]'");
});
test("יום בלי דוח ← null", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  assert.equal(await loadReport(s3, bucket, "2026-01-01"), null);
});
test("באג 2: תקלה אמיתית לא נבלעת", async (t) => {
  const { s3 } = await bucketSandbox(t);
  await assert.rejects(loadReport(s3, "no-such-bucket-" + process.pid, "2026-11-08"), "bucket שגוי ← שגיאה; null היה מציג 'אין מכירות' בדשבורד");
});
test("באג 3: Content-Type של JSON", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  await saveReport(s3, bucket, "2026-11-08", rows);
  const head = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: "reports/daily/2026-11-08.json" }));
  assert.match(head.ContentType ?? "", /^application\/json/);
});
