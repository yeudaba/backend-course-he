// P26.5-E60: השהיה לכל הודעה — בלי head-of-line
import type { Channel } from "amqplib";

export async function scheduleIn(ch: Channel, { waitPrefix, target }: { waitPrefix: string; target: string }, payload: unknown, delayMs: number) {
  const wait = `${waitPrefix}.${delayMs}`;
  await ch.assertQueue(wait, {
    durable: true,
    messageTtl: delayMs,
    deadLetterExchange: "",
    deadLetterRoutingKey: target,
    expires: delayMs + 60_000,
  });
  ch.sendToQueue(wait, Buffer.from(JSON.stringify(payload)), { persistent: true, contentType: "application/json" });
  return wait;
}
