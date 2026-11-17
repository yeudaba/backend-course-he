// P26-E85: timeout בתוך worker
import { Worker, type ConnectionOptions } from "bullmq";

export function startWorkerWithTimeout(connection: ConnectionOptions, prefix: string, queueName: string, handler: (data: any) => Promise<unknown>, timeoutMs: number) {
  return new Worker(
    queueName,
    async (job) => {
      let timer: NodeJS.Timeout | undefined;
      const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("TIMEOUT")), timeoutMs);
      });
      try {
        return await Promise.race([handler(job.data), timeout]);
      } finally {
        clearTimeout(timer);
      }
    },
    { connection, prefix },
  );
}
