// P26-E17
import { Queue, Worker, type ConnectionOptions } from "bullmq";

// תזכורת מתוזמנת: עבודה עם delay. jobId לפי ההזמנה — כדי שאפשר יהיה לבטל אותה כשהלקוח שילם
export function createReminders(connection: ConnectionOptions, prefix: string) {
  const queue = new Queue<{ orderId: number }>("reminders", { connection, prefix });
  return {
    queue,
    schedule: (orderId: number, delayMs: number) => queue.add("remind", { orderId }, { jobId: `remind-${orderId}`, delay: delayMs }),
    // שולם לפני הזמן — מבטלים. מחזיר true אם הייתה עבודה ממתינה שבוטלה
    async cancel(orderId: number) {
      const job = await queue.getJob(`remind-${orderId}`);
      if (!job || !(await job.isDelayed())) return false;
      await job.remove();
      return true;
    },
    close: () => queue.close(),
  };
}

export function startReminderWorker(connection: ConnectionOptions, prefix: string, remind: (orderId: number) => Promise<void>) {
  return new Worker<{ orderId: number }>("reminders", (job) => remind(job.data.orderId), { connection, prefix });
}
