// P26-E17: עבודות מתוזמנות (delay) וביטול
import { Queue, Worker, type ConnectionOptions } from "bullmq";

export function createReminders(connection: ConnectionOptions, prefix: string) {
  const queue = new Queue<{ orderId: number }>("reminders", { connection, prefix });
  return {
    queue,
    schedule: (orderId: number, delayMs: number) => queue.add("remind", { orderId }), // כתוב כאן
    async cancel(orderId: number): Promise<boolean> {
      return false; // כתוב כאן
    },
    close: () => queue.close(),
  };
}

export function startReminderWorker(connection: ConnectionOptions, prefix: string, remind: (orderId: number) => Promise<void>) {
  return new Worker<{ orderId: number }>("reminders", (job) => remind(job.data.orderId), { connection, prefix });
}
