// P26.5-E12: producer של Kafka — key לכל הזמנה, JSON, ו־headers
import type { Producer } from "@platformatic/kafka";

export interface OrderEvent {
  eventId: string;
  orderId: number;
  type: string;
  at: string;
  data?: unknown;
}

export async function publishOrderEvents(producer: Producer<string, string, string, string>, topic: string, events: OrderEvent[]) {
  throw new Error("עוד לא כתבת את הפתרון");
}
