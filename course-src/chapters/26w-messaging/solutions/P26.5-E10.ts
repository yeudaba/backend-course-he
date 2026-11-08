// P26.5-E10: consumer של SQS — long polling, ומחיקה רק אחרי הצלחה
import { SQSClient, ReceiveMessageCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";

export async function pollOnce(
  sqs: SQSClient,
  queueUrl: string,
  handler: (body: unknown) => Promise<void>,
  { waitSeconds = 20 } = {},
): Promise<{ handled: number; failed: number }> {
  const res = await sqs.send(
    new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: waitSeconds, // long polling: מחכה עד שיש הודעה, במקום לחזור ריק מיד
    }),
  );
  const done: { Id: string; ReceiptHandle: string }[] = [];
  let failed = 0;
  for (const [i, m] of (res.Messages ?? []).entries()) {
    try {
      await handler(JSON.parse(m.Body!));
      done.push({ Id: String(i), ReceiptHandle: m.ReceiptHandle! });
    } catch {
      failed++; // לא מוחקים: אחרי ה־visibility timeout ההודעה תחזור (ובסוף — ל־DLQ)
    }
  }
  if (done.length) {
    const del = await sqs.send(new DeleteMessageBatchCommand({ QueueUrl: queueUrl, Entries: done }));
    if (del.Failed?.length) throw new Error(`מחיקה נכשלה: ${del.Failed[0].Message}`);
  }
  return { handled: done.length, failed };
}
