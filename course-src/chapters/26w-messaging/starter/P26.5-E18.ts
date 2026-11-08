// P26.5-E18: retry עם השהיה — תור המתנה עם TTL, ו־dead letter חזרה
import type { Channel, ConsumeMessage } from "amqplib";

export interface RetryNames {
  queue: string;
  retryQueue: string;
  deadQueue: string;
}

export async function setupRetry(ch: Channel, n: RetryNames, delayMs: number): Promise<void> {
  throw new Error("עוד לא כתבת את הפתרון");
}

export async function startRetryingWorker(ch: Channel, n: RetryNames, handler: (job: any) => Promise<void>, { maxAttempts = 3 } = {}): Promise<string> {
  throw new Error("עוד לא כתבת את הפתרון");
}
