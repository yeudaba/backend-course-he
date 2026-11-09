// P26.3-E19: לרשום ולמחוק לפי prefix — עם pagination
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

export async function listAllKeys(s3: S3Client, bucket: string, prefix: string, pageSize = 1000): Promise<string[]> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function deletePrefix(s3: S3Client, bucket: string, prefix: string): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
