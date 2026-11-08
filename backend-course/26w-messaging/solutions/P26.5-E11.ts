// P26.5-E11: תור עם dead-letter queue
import { SQSClient, CreateQueueCommand, GetQueueAttributesCommand } from "@aws-sdk/client-sqs";

export async function createQueueWithDlq(
  sqs: SQSClient,
  name: string,
  { maxReceiveCount = 5, visibilityTimeout = 30 } = {},
): Promise<{ queueUrl: string; dlqUrl: string }> {
  const dlq = await sqs.send(
    new CreateQueueCommand({ QueueName: `${name}-dlq`, Attributes: { MessageRetentionPeriod: String(14 * 24 * 3600) } }),
  );
  const { Attributes } = await sqs.send(new GetQueueAttributesCommand({ QueueUrl: dlq.QueueUrl!, AttributeNames: ["QueueArn"] }));
  const main = await sqs.send(
    new CreateQueueCommand({
      QueueName: name,
      Attributes: {
        VisibilityTimeout: String(visibilityTimeout),
        RedrivePolicy: JSON.stringify({ deadLetterTargetArn: Attributes!.QueueArn, maxReceiveCount }),
      },
    }),
  );
  return { queueUrl: main.QueueUrl!, dlqUrl: dlq.QueueUrl! };
}
