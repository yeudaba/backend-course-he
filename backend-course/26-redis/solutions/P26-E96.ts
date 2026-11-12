// P26-E96: JobsService — עבודות עם jobId קבוע
import { Queue, type ConnectionOptions } from "bullmq";

const NAMES = new Set(["order-confirmation", "expire-order"]);

export function createJobs(connection: ConnectionOptions, prefix: string) {
  const queue = new Queue("shop", { connection, prefix });
  return {
    queue,
    async add(name: string, orderId: number, delayMs = 0) {
      if (!NAMES.has(name)) throw new Error(`עבודה לא מוכרת: ${name}`);
      await queue.add(
        name,
        { orderId },
        { jobId: `${name}-${orderId}`, delay: delayMs, attempts: 5, backoff: { type: "exponential", delay: 1000 }, removeOnComplete: 1000, removeOnFail: 5000 },
      );
      return true;
    },
    close: () => queue.close(),
  };
}
