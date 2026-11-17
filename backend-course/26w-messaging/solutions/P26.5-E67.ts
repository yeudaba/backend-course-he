// P26.5-E67: heartbeat ל־visibility בזמן עבודה ארוכה
import { ChangeMessageVisibilityCommand, type SQSClient } from "@aws-sdk/client-sqs";

export async function withVisibilityHeartbeat<T>(
  sqs: SQSClient,
  queueUrl: string,
  receiptHandle: string,
  work: () => Promise<T>,
  { visibilitySeconds, everyMs }: { visibilitySeconds: number; everyMs: number },
): Promise<T> {
  const timer = setInterval(() => {
    sqs.send(new ChangeMessageVisibilityCommand({ QueueUrl: queueUrl, ReceiptHandle: receiptHandle, VisibilityTimeout: visibilitySeconds })).catch(() => {});
  }, everyMs);
  try {
    return await work();
  } finally {
    clearInterval(timer);
  }
}
