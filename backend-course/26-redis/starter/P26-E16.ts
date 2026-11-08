// P26-E16: תור מיילים עם BullMQ
import { Queue, Worker, type ConnectionOptions } from "bullmq";

export interface Email {
  to: string;
  subject: string;
}

export function createEmailQueue(connection: ConnectionOptions, prefix: string) {
  const queue = new Queue<Email>("emails", { connection, prefix });
  return {
    queue,
    send: (id: string, email: Email) => queue.add("email", email), // כתוב כאן: dedupe ו־retries
    close: () => queue.close(),
  };
}

export function startEmailWorker(connection: ConnectionOptions, prefix: string, deliver: (email: Email) => Promise<void>): Worker<Email> {
  throw new Error("לא מומש"); // כתוב כאן
}
