// P26.5-E10: consumer של SQS — long polling, ומחיקה רק אחרי הצלחה
import { SQSClient, ReceiveMessageCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";

export async function pollOnce(
  sqs: SQSClient,
  queueUrl: string,
  handler: (body: unknown) => Promise<void>,
  { waitSeconds = 20 } = {},
): Promise<{ handled: number; failed: number }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
