// P26.5-E09: שליחה לתור FIFO — סדר לכל הזמנה, בלי כפילויות, ב־batches
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";

export interface OrderEvent {
  eventId: string;
  orderId: number;
  type: string;
  data?: unknown;
}

export async function sendOrderEvents(sqs: SQSClient, queueUrl: string, events: OrderEvent[]): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
