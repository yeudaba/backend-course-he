// P25.5-E22: דוחות יומיים ב־S3 — שלושה באגים
import { S3Client, PutObjectCommand, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";

export interface ReportRow {
  productId: number;
  sold: number;
}

const keyFor = (date: string) => `reports/daily/${date}.json`;

export async function saveReport(s3: S3Client, bucket: string, date: string, rows: ReportRow[]) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: keyFor(date),
      Body: JSON.stringify(rows),
    }),
  );
}

export async function loadReport(s3: S3Client, bucket: string, date: string): Promise<ReportRow[] | null> {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: keyFor(date) }));
    return JSON.parse(String(res.Body));
  } catch {
    return null; // אין דוח
  }
}
