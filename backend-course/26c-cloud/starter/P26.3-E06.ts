// P26.3-E06: לשמור ולקרוא JSON ב־S3
import { S3Client, PutObjectCommand, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

export async function putJson(s3: S3Client, bucket: string, key: string, value: unknown): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

// מחזיר null רק כשהמפתח לא קיים
export async function getJson<T = unknown>(s3: S3Client, bucket: string, key: string): Promise<T | null> {
  throw new Error("עוד לא כתבת את הפתרון");
}
