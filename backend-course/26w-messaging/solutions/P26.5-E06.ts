// P26.5-E06: topic exchange — מי מקבל איזה אירוע
import type { Channel } from "amqplib";

export interface Topology {
  exchange: string;
  emailQueue: string;
  analyticsQueue: string;
}

export interface OrderEvent {
  id: string;
  type: "created" | "paid" | "shipped" | "cancelled";
  orderId: number;
  country: string;
}

export async function setupTopology(ch: Channel, t: Topology): Promise<void> {
  await ch.assertExchange(t.exchange, "topic", { durable: true });
  await ch.assertQueue(t.emailQueue, { durable: true });
  await ch.assertQueue(t.analyticsQueue, { durable: true });
  // routing key: order.<type>.<country>  —  * = מילה אחת, # = אפס מילים או יותר
  await ch.bindQueue(t.emailQueue, t.exchange, "order.created.*");
  await ch.bindQueue(t.emailQueue, t.exchange, "order.shipped.*");
  await ch.bindQueue(t.analyticsQueue, t.exchange, "order.#");
}

export const routingKey = (e: OrderEvent) => `order.${e.type}.${e.country.toLowerCase()}`;

export function publishOrderEvent(ch: Channel, exchange: string, e: OrderEvent): boolean {
  return ch.publish(exchange, routingKey(e), Buffer.from(JSON.stringify(e)), {
    persistent: true, // נשמר בדיסק — שורד restart של RabbitMQ (בתור durable)
    contentType: "application/json",
    messageId: e.id,
  });
}
