// P26.5-E54: worker שנותן הזדמנות שנייה אחת
import type { Channel } from "amqplib";

export async function startSecondChanceWorker(ch: Channel, queue: string, handler: (job: unknown) => Promise<void>) {
  await ch.prefetch(1);
  const { consumerTag } = await ch.consume(queue, async (msg) => {
    if (!msg) return;
    let job: unknown;
    try {
      job = JSON.parse(msg.content.toString());
    } catch {
      return ch.nack(msg, false, false); // קבוע — אין טעם לנסות שוב
    }
    try {
      await handler(job);
      ch.ack(msg);
    } catch {
      ch.nack(msg, false, !msg.fields.redelivered); // ראשון ← עוד ניסיון; שני ← dead letter
    }
  });
  return consumerTag;
}
