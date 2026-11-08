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
  const res = await producer.send({
    messages: events.map((e) => ({
      topic,
      key: String(e.orderId), // אותו key ← אותו partition ← סדר נשמר לכל הזמנה
      value: JSON.stringify(e),
      headers: { "event-type": e.type, "event-id": e.eventId },
    })),
  });
  return res.offsets ?? [];
}
