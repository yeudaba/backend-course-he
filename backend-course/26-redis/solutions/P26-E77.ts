// P26-E77: worker עם התקדמות
import { Worker, type ConnectionOptions } from "bullmq";

export function startImportWorker(connection: ConnectionOptions, prefix: string, handleItem: (item: string) => Promise<void>) {
  return new Worker(
    "imports",
    async (job) => {
      const items: string[] = job.data.items;
      if (items.length === 0) {
        await job.updateProgress(100);
        return { processed: 0 };
      }
      for (let i = 0; i < items.length; i++) {
        await handleItem(items[i]);
        await job.updateProgress(Math.round(((i + 1) / items.length) * 100));
      }
      return { processed: items.length };
    },
    { connection, prefix },
  );
}
