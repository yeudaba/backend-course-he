// P26.5-E22: סנכרון סטטוסים של הזמנות דרך Kafka — שלוש תקלות
import { Consumer, MessagesStreamModes, stringDeserializers, type Producer } from "@platformatic/kafka";

export async function publishStatus(producer: Producer<string, string, string, string>, topic: string, orderId: number, status: string) {
  await producer.send({
    messages: [{ topic, value: JSON.stringify({ orderId, status }) }],
  });
}

export async function syncStatuses(
  opts: { brokers: string[]; groupId: string; topic: string },
  save: (orderId: number, status: string) => Promise<void>,
  max: number,
) {
  const consumer = new Consumer({ groupId: opts.groupId, clientId: "status-sync", bootstrapBrokers: opts.brokers, deserializers: stringDeserializers });
  const stream = await consumer.consume({ topics: [opts.topic], mode: MessagesStreamModes.LATEST, autocommit: false });
  let n = 0;
  try {
    for await (const m of stream) {
      await m.commit();
      const { orderId, status } = JSON.parse(m.value);
      await save(orderId, status);
      if (++n >= max) break;
    }
  } finally {
    await stream.close().catch(() => {});
    await consumer.close();
  }
  return n;
}
