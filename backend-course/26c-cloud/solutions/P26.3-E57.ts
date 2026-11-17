// P26.3-E57: ייצוא CSV ל־S3
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

function cell(v: unknown) {
  const s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "";
  const cols = Object.keys(rows[0]);
  const lines = [cols.map(cell).join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))];
  return lines.join("\r\n") + "\r\n";
}

export async function exportCsv(s3: S3Client, bucket: string, key: string, rows: Record<string, unknown>[]) {
  const body = "﻿" + toCsv(rows);
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: "text/csv; charset=utf-8" }));
  return { rows: rows.length, bytes: Buffer.byteLength(body) };
}
