// P26.5-E20: ה־worker אחרי התיקון
import type { Channel } from "amqplib";

export async function startEmailWorker(ch: Channel, queue: string, sendEmail: (to: string, subject: string) => Promise<void>) {
  await ch.prefetch(10); // תיקון 2: בלי prefetch RabbitMQ שולח את כל התור ל־worker אחד, לזיכרון
  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    try {
      const { to, subject } = JSON.parse(msg.content.toString());
      await sendEmail(to, subject);
      ch.ack(msg); // תיקון 1: ack רק אחרי ששלחנו — לא לפני
    } catch {
      ch.nack(msg, false, false); // תיקון 3: requeue=false ← dead letter, לא לולאה אינסופית
    }
  });
}
