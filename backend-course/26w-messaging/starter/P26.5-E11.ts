// P26.5-E11: תור עם dead-letter queue
import { SQSClient, CreateQueueCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";

export async function createQueueWithDlq(
  sqs: SQSClient,
  name: string,
  { maxReceiveCount = 5, visibilityTimeout = 30 } = {},
): Promise<{ queueUrl: string; dlqUrl: string }> {
  throw new Error("עוד לא כתבת את הפתרון");
}
