// P26.5-E22: אחרי התיקון
import { Consumer, MessagesStreamModes, MessagesStreamFallbackModes, stringDeserializers, type Producer } from "@platformatic/kafka";

export async function publishStatus(producer: Producer<string, string, string, string>, topic: string, orderId: number, status: string) {
  await producer.send({
    messages: [{ topic, key: String(orderId), value: JSON.stringify({ orderId, status }) }], // תיקון 1: key — אחרת אין סדר בין עדכונים של אותה הזמנה
  });
}

export async function syncStatuses(
  opts: { brokers: string[]; groupId: string; topic: string },
  save: (orderId: number, status: string) => Promise<void>,
  max: number,
) {
  const consumer = new Consumer({ groupId: opts.groupId, clientId: "status-sync", bootstrapBrokers: opts.brokers, deserializers: stringDeserializers });
  const stream = await consumer.consume({
    topics: [opts.topic],
    mode: MessagesStreamModes.COMMITTED,
    fallbackMode: MessagesStreamFallbackModes.EARLIEST, // תיקון 3: group חדש מתחיל מההתחלה, לא רק מהודעות חדשות
    autocommit: false,
  });
  let n = 0;
  try {
    for await (const m of stream) {
      const { orderId, status } = JSON.parse(m.value);
      await save(orderId, status);
      await m.commit(); // תיקון 2: commit אחרי save, לא לפני
      if (++n >= max) break;
    }
  } finally {
    await stream.close().catch(() => {});
    await consumer.close();
  }
  return n;
}
