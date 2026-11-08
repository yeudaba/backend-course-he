// P26.5-E21: הפקת חשבוניות מתור SQS — שלוש תקלות
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

export async function processInvoices(sqs: SQSClient, queueUrl: string, issue: (invoice: any) => Promise<void>) {
  const res = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10 }));
  const messages = res.Messages ?? [];
  let issued = 0;
  for (const m of messages) {
    await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: messages[0].ReceiptHandle! }));
    try {
      await issue(JSON.parse(m.Body!));
      issued++;
    } catch {
      // ננסה בפעם הבאה
    }
  }
  return issued;
}
