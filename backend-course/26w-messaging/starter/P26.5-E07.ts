// P26.5-E07: worker עם prefetch, ack אחרי הצלחה, ו־dead letter לכישלונות
import type { Channel, ConsumeMessage } from "amqplib";

export interface WorkQueue {
  queue: string;
  deadLetterExchange: string;
  deadLetterQueue: string;
}

export async function setupWorkQueue(ch: Channel, w: WorkQueue): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function startWorker(ch: Channel, queue: string, handler: (job: unknown) => Promise<void>, { prefetch = 5 } = {}): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}
