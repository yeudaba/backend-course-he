import { test } from "node:test";
import assert from "node:assert/strict";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { load } from "../../tools/load.mjs";
import { bucketSandbox } from "../../tools/aws.mjs";

const { toCsv, exportCsv } = await load(import.meta.url, "P26.3-E57.ts");
const rows = [
  { id: 1, customer: "דנה כהן", total: 59.8, note: null, at: new Date("2026-11-08T07:58:46Z") },
  { id: 2, customer: 'קפה "טוב", בע״מ', total: 120, note: "שורה 1\nשורה 2", at: new Date("2026-11-09T10:00:00Z") },
];

test("toCsv", () => {
  assert.equal(
    toCsv(rows),
    'id,customer,total,note,at\r\n1,דנה כהן,59.8,,2026-11-08T07:58:46.000Z\r\n2,"קפה ""טוב"", בע״מ",120,"שורה 1\nשורה 2",2026-11-09T10:00:00.000Z\r\n',
  );
  assert.equal(toCsv([]), "");
  assert.equal(toCsv([{ a: undefined, b: 0, c: false }]), "a,b,c\r\n,0,false\r\n");
});
test("exportCsv: BOM, ContentType ובתים", async (t) => {
  const { s3, bucket } = await bucketSandbox(t);
  const r = await exportCsv(s3, bucket, "exports/2026-11.csv", rows);
  const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: "exports/2026-11.csv" }));
  assert.match(obj.ContentType ?? "", /^text\/csv; ?charset=utf-8$/i);
  const bytes = Buffer.from(await obj.Body.transformToByteArray());
  assert.deepEqual([...bytes.subarray(0, 3)], [0xef, 0xbb, 0xbf], "BOM בהתחלה");
  assert.equal(bytes.subarray(3).toString("utf8"), toCsv(rows));
  assert.deepEqual(r, { rows: 2, bytes: bytes.length }, "bytes — בתים, לא תווים");
});
