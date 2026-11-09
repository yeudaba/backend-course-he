// P26.3-E07: כתובת חתומה (presigned URL) להעלאת קובץ ישירות ל־S3
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

export const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
export const MAX_BYTES = 5 * 1024 * 1024;
export const EXPIRES_IN = 300;

export interface UploadRequest {
  userId: number;
  filename: string;
  contentType: string;
  size: number;
}

export function safeName(filename: string): string {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function createUploadUrl(s3: S3Client, bucket: string, req: UploadRequest): Promise<{ url: string; key: string; expiresIn: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
