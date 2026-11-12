// P26.5-E70: עומק התור, וכמה workers צריך
import { GetQueueAttributesCommand, type SQSClient } from "@aws-sdk/client-sqs";

export async function queueDepth(sqs: SQSClient, queueUrl: string) {
  const { Attributes: a = {} } = await sqs.send(
    new GetQueueAttributesCommand({
      QueueUrl: queueUrl,
      AttributeNames: ["ApproximateNumberOfMessages", "ApproximateNumberOfMessagesNotVisible", "ApproximateNumberOfMessagesDelayed"],
    }),
  );
  return {
    visible: Number(a.ApproximateNumberOfMessages ?? 0),
    inFlight: Number(a.ApproximateNumberOfMessagesNotVisible ?? 0),
    delayed: Number(a.ApproximateNumberOfMessagesDelayed ?? 0),
  };
}

export function workersNeeded(depth: { visible: number; inFlight: number }, { perWorker, min, max }: { perWorker: number; min: number; max: number }) {
  return Math.min(max, Math.max(min, Math.ceil((depth.visible + depth.inFlight) / perWorker)));
}
