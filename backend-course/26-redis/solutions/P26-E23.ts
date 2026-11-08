// P26-E23
import { Queue, Worker, type ConnectionOptions } from "bullmq";

export function createConfirmations(connection: ConnectionOptions, prefix: string, deliver: (orderId: number) => Promise<void>) {
  const queue = new Queue<{ orderId: number }>("confirmations", { connection, prefix });
  // תקלה 1: try/catch שבולע את השגיאה — מבחינת BullMQ העבודה "הצליחה", ואין retry. נותנים לשגיאה לעלות
  const worker = new Worker<{ orderId: number }>("confirmations", (job) => deliver(job.data.orderId), { connection, prefix });
  return {
    // תקלה 2: jobId אקראי — כל קריאה היא עבודה חדשה (תשלום שנשלח פעמיים ← שני מיילים). מזהה עסקי
    // תקלה 3: בלי attempts — ניסיון אחד בלבד
    send: (orderId: number) => queue.add("confirm", { orderId }, { jobId: `confirm-${orderId}`, attempts: 5, backoff: { type: "exponential", delay: 50 } }),
    close: async () => {
      await worker.close();
      await queue.close();
    },
  };
}
