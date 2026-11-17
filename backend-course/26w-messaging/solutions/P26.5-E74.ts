// P26.5-E74: claim check — הודעה גדולה דרך S3
import { randomUUID } from "node:crypto";
import { GetObjectCommand, PutObjectCommand, type S3Client } from "@aws-sdk/client-s3";
import { SendMessageCommand, type SQSClient } from "@aws-sdk/client-sqs";

export async function sendClaimCheck(
  { s3, sqs }: { s3: S3Client; sqs: SQSClient },
  { bucket, queueUrl }: { bucket: string; queueUrl: string },
  payload: unknown,
  limitBytes = 200_000,
): Promise<"inline" | "s3"> {
  const json = JSON.stringify(payload);
  if (Buffer.byteLength(json) <= limitBytes) {
    await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ inline: payload }) }));
    return "inline";
  }
  const s3Key = `claims/${randomUUID()}.json`;
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: s3Key, Body: json, ContentType: "application/json" }));
  await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify({ s3Key }) }));
  return "s3";
}

export async function readClaimCheck(s3: S3Client, bucket: string, body: string) {
  const msg = JSON.parse(body) as { inline?: unknown; s3Key?: string };
  if (msg.s3Key) {
    const obj = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: msg.s3Key }));
    return JSON.parse(await obj.Body!.transformToString());
  }
  return msg.inline;
}
