// P26.5-E53: fanout — הודעה לכל ה־instances
import type { Channel } from "amqplib";

export async function subscribeInstance(ch: Channel, exchange: string, onMessage: (data: unknown) => void) {
  await ch.assertExchange(exchange, "fanout", { durable: false });
  const { queue } = await ch.assertQueue("", { exclusive: true });
  await ch.bindQueue(queue, exchange, "");
  const { consumerTag } = await ch.consume(queue, (msg) => {
    if (msg) onMessage(JSON.parse(msg.content.toString()));
  }, { noAck: true });
  return {
    queue,
    async cancel() {
      await ch.cancel(consumerTag);
    },
  };
}

export function broadcast(ch: Channel, exchange: string, data: unknown) {
  return ch.publish(exchange, "", Buffer.from(JSON.stringify(data)), { contentType: "application/json" });
}
