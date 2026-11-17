// P26.5-E61: עצירה מסודרת של consumer
import type { Channel, ConsumeMessage } from "amqplib";

export async function startConsumer(ch: Channel, queue: string, handler: (job: unknown) => Promise<void>, prefetch: number) {
  await ch.prefetch(prefetch);
  const inFlight = new Set<Promise<void>>();
  const handle = async (msg: ConsumeMessage) => {
    try {
      await handler(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch {
      ch.nack(msg, false, false);
    }
  };
  const { consumerTag } = await ch.consume(queue, (msg) => {
    if (!msg) return;
    const p = handle(msg).finally(() => inFlight.delete(p));
    inFlight.add(p);
  });
  return {
    async stop() {
      await ch.cancel(consumerTag);
      await Promise.allSettled([...inFlight]);
      await ch.close();
    },
  };
}
