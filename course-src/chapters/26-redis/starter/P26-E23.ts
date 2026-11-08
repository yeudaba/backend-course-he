// P26-E23: מייל אישור דרך תור. שלוש תקלות: לקוחות מקבלים לפעמים שני מיילים,
// ומייל שנכשל פעם אחת (SMTP לא זמין לרגע) לא נשלח לעולם. מצא ותקן
import { randomUUID } from "node:crypto";
import { Queue, Worker, type ConnectionOptions } from "bullmq";

export function createConfirmations(connection: ConnectionOptions, prefix: string, deliver: (orderId: number) => Promise<void>) {
  const queue = new Queue<{ orderId: number }>("confirmations", { connection, prefix });
  const worker = new Worker<{ orderId: number }>(
    "confirmations",
    async (job) => {
      try {
        await deliver(job.data.orderId);
      } catch (err) {
        console.error("send failed", (err as Error).message);
      }
    },
    { connection, prefix },
  );
  return {
    send: (orderId: number) => queue.add("confirm", { orderId }, { jobId: randomUUID() }),
    close: async () => {
      await worker.close();
      await queue.close();
    },
  };
}
