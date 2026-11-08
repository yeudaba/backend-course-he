// P25.5-E06: לשמור ולקרוא JSON ב־S3
import { S3Client, PutObjectCommand, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

export async function putJson(s3: S3Client, bucket: string, key: string, value: unknown): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(value),
      ContentType: "application/json; charset=utf-8",
    }),
  );
}

export async function getJson<T = unknown>(s3: S3Client, bucket: string, key: string): Promise<T | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const text = await res.Body!.transformToString("utf-8");
    return JSON.parse(text) as T;
  } catch (err) {
    if (err instanceof NoSuchKey) return null; // רק "אין כזה" הוא null; כל שגיאה אחרת — למעלה
    throw err;
  }
}
