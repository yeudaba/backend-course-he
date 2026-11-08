// P26.5-E21: ה־consumer אחרי התיקון
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

export async function processInvoices(sqs: SQSClient, queueUrl: string, issue: (invoice: any) => Promise<void>) {
  const res = await sqs.send(
    new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 20 }), // תיקון 3: long polling
  );
  let issued = 0;
  for (const m of res.Messages ?? []) {
    try {
      await issue(JSON.parse(m.Body!));
    } catch {
      continue; // תיקון 1: לא מוחקים לפני שהצליח — ההודעה תחזור
    }
    await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle! })); // תיקון 2: ה־ReceiptHandle של ההודעה הזו
    issued++;
  }
  return issued;
}
