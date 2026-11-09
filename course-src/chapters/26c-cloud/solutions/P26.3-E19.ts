// P26.3-E19: לרשום ולמחוק לפי prefix — עם pagination
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function listAllKeys(s3: S3Client, bucket: string, prefix: string, pageSize = 1000): Promise<string[]> {
  const keys: string[] = [];
  let token: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: pageSize, ContinuationToken: token }),
    );
    for (const o of page.Contents ?? []) keys.push(o.Key!);
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return keys;
}

export async function deletePrefix(s3: S3Client, bucket: string, prefix: string): Promise<number> {
  if (!prefix || !prefix.endsWith("/")) throw new Error('prefix חייב להיות תיקייה שמסתיימת ב־"/" (ולא ריק — זה כל ה־bucket)');
  const keys = await listAllKeys(s3, bucket, prefix);
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    const res = await s3.send(
      new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true } }),
    );
    if (res.Errors?.length) throw new Error(`מחיקה נכשלה: ${res.Errors[0].Key} — ${res.Errors[0].Message}`);
  }
  return keys.length;
}
