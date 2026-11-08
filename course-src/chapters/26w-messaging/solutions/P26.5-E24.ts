// P26.5-E24: צינור ההזמנות של חנות הקפה ב־RabbitMQ
import type { Channel, ConfirmChannel } from "amqplib";

export interface PipelineNames {
  exchange: string;
  emailQueue: string;
  inventoryQueue: string;
  deadLetterExchange: string;
  deadLetterQueue: string;
}

export interface OrderPlaced {
  eventId: string;
  orderId: number;
  email: string;
  items: { productId: number; quantity: number }[];
}

export async function setupOrderPipeline(ch: Channel, n: PipelineNames): Promise<void> {
  await ch.assertExchange(n.exchange, "topic", { durable: true });
  await ch.assertExchange(n.deadLetterExchange, "fanout", { durable: true });
  await ch.assertQueue(n.deadLetterQueue, { durable: true });
  await ch.bindQueue(n.deadLetterQueue, n.deadLetterExchange, "");
  for (const q of [n.emailQueue, n.inventoryQueue]) {
    await ch.assertQueue(q, { durable: true, deadLetterExchange: n.deadLetterExchange });
    await ch.bindQueue(q, n.exchange, "order.placed");
  }
}

// publisher confirms: מחכים שה־broker אישר שקיבל (ושמר) — רק אז "נשלח"
export async function publishOrderPlaced(ch: ConfirmChannel, exchange: string, e: OrderPlaced): Promise<void> {
  ch.publish(exchange, "order.placed", Buffer.from(JSON.stringify(e)), {
    persistent: true,
    contentType: "application/json",
    messageId: e.eventId,
  });
  await ch.waitForConfirms();
}

export interface ProcessedStore {
  // true אם זו הפעם הראשונה (ונרשם), false אם כבר טופל
  markIfNew(consumer: string, eventId: string): Promise<boolean>;
  unmark(consumer: string, eventId: string): Promise<void>;
}

export function memoryStore(): ProcessedStore {
  const seen = new Set<string>();
  return {
    async markIfNew(c, id) {
      const k = `${c}:${id}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    },
    async unmark(c, id) {
      seen.delete(`${c}:${id}`);
    },
  };
}

function isOrderPlaced(x: any): x is OrderPlaced {
  return (
    x && typeof x.eventId === "string" && Number.isInteger(x.orderId) && typeof x.email === "string" &&
    Array.isArray(x.items) && x.items.every((i: any) => Number.isInteger(i.productId) && Number.isInteger(i.quantity) && i.quantity > 0)
  );
}

// consumer אידמפוטנטי: אותו eventId פעמיים ← פעולה אחת. הודעה פגומה ← dead letter מיד
export async function startConsumer(
  ch: Channel,
  queue: string,
  name: string,
  store: ProcessedStore,
  handle: (e: OrderPlaced) => Promise<void>,
): Promise<string> {
  await ch.prefetch(10);
  const { consumerTag } = await ch.consume(queue, async (msg) => {
    if (!msg) return;
    let e: unknown;
    try {
      e = JSON.parse(msg.content.toString());
    } catch {
      return ch.nack(msg, false, false);
    }
    if (!isOrderPlaced(e)) return ch.nack(msg, false, false);
    if (!(await store.markIfNew(name, e.eventId))) return ch.ack(msg); // כפילות — כבר טופל
    try {
      await handle(e);
      ch.ack(msg);
    } catch {
      await store.unmark(name, e.eventId); // לא הצליח — שיוכל לנסות שוב
      ch.nack(msg, false, false);
    }
  });
  return consumerTag;
}
