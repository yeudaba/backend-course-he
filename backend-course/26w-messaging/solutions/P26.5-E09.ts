// P26.5-E09: שליחה לתור FIFO — סדר לכל הזמנה, בלי כפילויות, ב־batches
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

export interface OrderEvent {
  eventId: string;
  orderId: number;
  type: string;
  data?: unknown;
}

export async function sendOrderEvents(sqs: SQSClient, queueUrl: string, events: OrderEvent[]): Promise<number> {
  let sent = 0;
  for (let i = 0; i < events.length; i += 10) {
    const chunk = events.slice(i, i + 10); // SQS: עד 10 הודעות ב־batch
    const res = await sqs.send(
      new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: chunk.map((e, j) => ({
          Id: String(j), // ייחודי בתוך ה־batch בלבד
          MessageBody: JSON.stringify(e),
          MessageGroupId: String(e.orderId), // סדר נשמר בתוך קבוצה
          MessageDeduplicationId: e.eventId, // אותו id תוך 5 דקות ← נשלח פעם אחת
          MessageAttributes: { type: { DataType: "String", StringValue: e.type } },
        })),
      }),
    );
    if (res.Failed?.length) {
      const ids = res.Failed.map((f) => chunk[Number(f.Id)].eventId);
      throw new Error(`שליחה נכשלה עבור: ${ids.join(", ")} (${res.Failed[0].Code})`);
    }
    sent += res.Successful?.length ?? 0;
  }
  return sent;
}
