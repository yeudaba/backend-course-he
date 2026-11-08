// P26.5-E18: retry עם השהיה — תור המתנה עם TTL, ו־dead letter חזרה
import type { Channel, ConsumeMessage } from "amqplib";

export interface RetryNames {
  queue: string; // העבודה
  retryQueue: string; // ממתינים delayMs, ואז חוזרים ל־queue
  deadQueue: string; // נכשלו maxAttempts פעמים
}

export async function setupRetry(ch: Channel, n: RetryNames, delayMs: number): Promise<void> {
  // nack ב־queue ← default exchange ("") עם routing key = retryQueue
  await ch.assertQueue(n.queue, { durable: true, deadLetterExchange: "", deadLetterRoutingKey: n.retryQueue });
  // TTL פג ב־retryQueue ← default exchange עם routing key = queue
  await ch.assertQueue(n.retryQueue, { durable: true, messageTtl: delayMs, deadLetterExchange: "", deadLetterRoutingKey: n.queue });
  await ch.assertQueue(n.deadQueue, { durable: true });
}

// כמה פעמים ההודעה כבר נדחתה מ־queue (RabbitMQ סופר ב־x-death)
export function attemptsSoFar(msg: ConsumeMessage, queue: string): number {
  const deaths = (msg.properties.headers?.["x-death"] ?? []) as { queue: string; reason: string; count: number }[];
  return deaths.find((d) => d.queue === queue && d.reason === "rejected")?.count ?? 0;
}

export async function startRetryingWorker(
  ch: Channel,
  n: RetryNames,
  handler: (job: any) => Promise<void>,
  { maxAttempts = 3 } = {},
): Promise<string> {
  await ch.prefetch(10);
  const { consumerTag } = await ch.consume(n.queue, async (msg) => {
    if (!msg) return;
    const attempt = attemptsSoFar(msg, n.queue) + 1;
    try {
      await handler(JSON.parse(msg.content.toString()));
      ch.ack(msg);
    } catch (err) {
      if (attempt >= maxAttempts) {
        ch.sendToQueue(n.deadQueue, msg.content, {
          persistent: true,
          contentType: msg.properties.contentType,
          headers: { "x-attempts": attempt, "x-error": String((err as Error)?.message ?? err) },
        });
        ch.ack(msg);
      } else {
        ch.nack(msg, false, false); // ← retryQueue, ואחרי delayMs חזרה
      }
    }
  });
  return consumerTag;
}
