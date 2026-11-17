// P26.5-E75: poller שנעצר יפה
import { DeleteMessageCommand, ReceiveMessageCommand, type SQSClient } from "@aws-sdk/client-sqs";

export function startPoller(sqs: SQSClient, queueUrl: string, handler: (body: unknown) => Promise<void>, { waitSeconds }: { waitSeconds: number }) {
  let running = true;
  const counts = { handled: 0, failed: 0 };
  const loop = (async () => {
    while (running) {
      let msgs;
      try {
        ({ Messages: msgs = [] } = await sqs.send(new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: waitSeconds })));
      } catch {
        await new Promise((r) => setTimeout(r, 200));
        continue;
      }
      for (const m of msgs) {
        try {
          await handler(JSON.parse(m.Body!));
          await sqs.send(new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: m.ReceiptHandle! }));
          counts.handled++;
        } catch {
          counts.failed++;
        }
      }
    }
  })();
  return {
    async stop() {
      running = false;
      await loop;
    },
    stats: () => ({ ...counts }),
  };
}
