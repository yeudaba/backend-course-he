// P26-E16
import { Queue, Worker, type ConnectionOptions } from "bullmq";

export interface Email {
  to: string;
  subject: string;
}

// יצרן: מוסיף עבודה. jobId מהעסק (לא אקראי): אותו מייל פעמיים = עבודה אחת
export function createEmailQueue(connection: ConnectionOptions, prefix: string) {
  const queue = new Queue<Email>("emails", { connection, prefix });
  return {
    queue,
    send: (id: string, email: Email) =>
      queue.add("email", email, { jobId: id, attempts: 4, backoff: { type: "exponential", delay: 50 }, removeOnComplete: 100 }),
    close: () => queue.close(),
  };
}

// צרכן: מריץ את deliver; זריקה ← BullMQ ינסה שוב (attempts), עם backoff
export function startEmailWorker(connection: ConnectionOptions, prefix: string, deliver: (email: Email) => Promise<void>) {
  return new Worker<Email>("emails", async (job) => deliver(job.data), { connection, prefix, concurrency: 5 });
}
