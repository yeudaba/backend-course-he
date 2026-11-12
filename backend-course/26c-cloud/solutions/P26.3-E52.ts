// P26.3-E52: rename ב־S3 — העתקה ומחיקה
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function moveObject(s3: S3Client, bucket: string, from: string, to: string) {
  if (from === to) return true;
  try {
    await s3.send(new CopyObjectCommand({ Bucket: bucket, Key: to, CopySource: `${bucket}/${encodeURIComponent(from)}` }));
  } catch (err) {
    if ((err as { name?: string }).name === "NoSuchKey") return false; // רק "אין מקור". NoSuchBucket — באג, שיעלה
    throw err;
  }
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: from }));
  return true;
}
