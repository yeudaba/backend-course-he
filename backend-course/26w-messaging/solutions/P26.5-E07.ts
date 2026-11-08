// P26.5-E07: worker עם prefetch, ack אחרי הצלחה, ו־dead letter לכישלונות
import type { Channel, ConsumeMessage } from "amqplib";

export interface WorkQueue {
  queue: string;
  deadLetterExchange: string;
  deadLetterQueue: string;
}

export async function setupWorkQueue(ch: Channel, w: WorkQueue): Promise<void> {
  await ch.assertExchange(w.deadLetterExchange, "fanout", { durable: true });
  await ch.assertQueue(w.deadLetterQueue, { durable: true });
  await ch.bindQueue(w.deadLetterQueue, w.deadLetterExchange, "");
  await ch.assertQueue(w.queue, { durable: true, deadLetterExchange: w.deadLetterExchange });
}

export async function startWorker(
  ch: Channel,
  queue: string,
  handler: (job: unknown) => Promise<void>,
  { prefetch = 5 } = {},
): Promise<string> {
  await ch.prefetch(prefetch); // לכל היותר prefetch הודעות שלא אושרו — בזמן נתון
  const { consumerTag } = await ch.consume(queue, async (msg: ConsumeMessage | null) => {
    if (!msg) return; // התור נמחק / ה־consumer בוטל
    try {
      const job = JSON.parse(msg.content.toString());
      await handler(job);
      ch.ack(msg); // רק אחרי שהעבודה הצליחה
    } catch {
      ch.nack(msg, false, false); // requeue=false ← ל־dead letter exchange, לא חזרה לראש התור
    }
  });
  return consumerTag;
}
