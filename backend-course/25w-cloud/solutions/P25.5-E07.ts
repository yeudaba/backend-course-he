// P25.5-E07: כתובת חתומה (presigned URL) להעלאת קובץ ישירות ל־S3
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
  const base = filename.split(/[\\/]/).pop() ?? "";
  const clean = base.replace(/[^A-Za-z0-9._-]/g, "_").replace(/^\.+/, "").slice(-100);
  return clean || "file";
}

export async function createUploadUrl(s3: S3Client, bucket: string, req: UploadRequest) {
  if (!ALLOWED_TYPES.includes(req.contentType)) throw new Error(`סוג קובץ לא מותר: ${req.contentType}`);
  if (!Number.isInteger(req.size) || req.size <= 0 || req.size > MAX_BYTES) throw new Error("גודל קובץ לא תקין (עד 5MB)");
  if (!Number.isInteger(req.userId) || req.userId <= 0) throw new Error("userId לא תקין");
  const key = `uploads/${req.userId}/${randomUUID()}-${safeName(req.filename)}`;
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: req.contentType, ContentLength: req.size }),
    { expiresIn: EXPIRES_IN },
  );
  return { url, key, expiresIn: EXPIRES_IN, headers: { "content-type": req.contentType } };
}
