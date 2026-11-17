// P26-E78: לוח בקרה — מצב התור והרצה מחדש
import type { Queue } from "bullmq";

export async function queueStats(queue: Queue) {
  const c = await queue.getJobCounts("waiting", "active", "delayed", "completed", "failed");
  return { waiting: c.waiting ?? 0, active: c.active ?? 0, delayed: c.delayed ?? 0, completed: c.completed ?? 0, failed: c.failed ?? 0 };
}

export async function retryAllFailed(queue: Queue) {
  const jobs = await queue.getFailed(0, -1);
  for (const job of jobs) await job.retry();
  return jobs.length;
}
