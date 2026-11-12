// P26.5-E69: redrive — מה־DLQ חזרה לתור
import { DeleteMessageBatchCommand, ReceiveMessageCommand, SendMessageBatchCommand, type SQSClient } from "@aws-sdk/client-sqs";

export async function redrive(sqs: SQSClient, fromUrl: string, toUrl: string, max = Infinity) {
  let moved = 0;
  while (moved < max) {
    const { Messages: msgs = [] } = await sqs.send(
      new ReceiveMessageCommand({ QueueUrl: fromUrl, MaxNumberOfMessages: Math.min(10, max - moved), WaitTimeSeconds: 0 }),
    );
    if (msgs.length === 0) break;
    const sent = await sqs.send(new SendMessageBatchCommand({ QueueUrl: toUrl, Entries: msgs.map((m, i) => ({ Id: String(i), MessageBody: m.Body! })) }));
    const ok = (sent.Successful ?? []).map((s) => msgs[Number(s.Id)]);
    if (ok.length) {
      await sqs.send(new DeleteMessageBatchCommand({ QueueUrl: fromUrl, Entries: ok.map((m, i) => ({ Id: String(i), ReceiptHandle: m.ReceiptHandle! })) }));
    }
    moved += ok.length;
  }
  return moved;
}
