// P26.5-E14: consumer group — commit רק אחרי שהטיפול הצליח
import { Consumer, MessagesStreamModes, MessagesStreamFallbackModes, stringDeserializers } from "@platformatic/kafka";

export interface ConsumeOptions {
  brokers: string[];
  groupId: string;
  topic: string;
}

export async function consumeAndCommit(
  { brokers, groupId, topic }: ConsumeOptions,
  handler: (event: any) => Promise<void>,
  { max }: { max: number },
): Promise<number> {
  const consumer = new Consumer({ groupId, clientId: `${groupId}-worker`, bootstrapBrokers: brokers, deserializers: stringDeserializers });
  const stream = await consumer.consume({
    topics: [topic],
    mode: MessagesStreamModes.COMMITTED, // ממשיכים מאיפה שה־group עצר
    fallbackMode: MessagesStreamFallbackModes.EARLIEST, // group חדש ← מההתחלה
    autocommit: false,
  });
  let processed = 0;
  try {
    for await (const m of stream) {
      await handler(JSON.parse(m.value)); // נכשל ← יוצאים בלי commit; ההודעה תגיע שוב
      await m.commit();
      if (++processed >= max) break;
    }
  } finally {
    await stream.close().catch(() => {});
    await consumer.close();
  }
  return processed;
}
