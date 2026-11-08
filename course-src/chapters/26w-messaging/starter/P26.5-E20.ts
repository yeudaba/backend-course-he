// P26.5-E20: ה־worker של המיילים — שלוש תקלות
import type { Channel } from "amqplib";

export async function startEmailWorker(ch: Channel, queue: string, sendEmail: (to: string, subject: string) => Promise<void>) {
  await ch.consume(queue, async (msg) => {
    if (!msg) return;
    ch.ack(msg);
    try {
      const { to, subject } = JSON.parse(msg.content.toString());
      await sendEmail(to, subject);
    } catch {
      ch.nack(msg);
    }
  });
}
