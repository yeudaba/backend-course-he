// P26.5-E14: consumer group — commit רק אחרי שהטיפול הצליח
import { Consumer, MessagesStreamModes, MessagesStreamFallbackModes, stringDeserializers } from "@platformatic/kafka";

export interface ConsumeOptions {
  brokers: string[];
  groupId: string;
  topic: string;
}

export async function consumeAndCommit({ brokers, groupId, topic }: ConsumeOptions, handler: (event: any) => Promise<void>, { max }: { max: number }): Promise<number> {
  throw new Error("עוד לא כתבת את הפתרון");
}
