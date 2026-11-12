// P26.5-E68: שליחה ב־batches — וגם מה שנכשל
import { SendMessageBatchCommand, type SQSClient } from "@aws-sdk/client-sqs";

export async function sendAll(sqs: SQSClient, queueUrl: string, messages: { id: string; body: unknown }[]) {
  const ok = new Set<string>();
  const bad = new Map<string, string>();
  for (let i = 0; i < messages.length; i += 10) {
    const chunk = messages.slice(i, i + 10);
    const res = await sqs.send(
      new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: chunk.map((m) => ({ Id: m.id, MessageBody: JSON.stringify(m.body) })) }),
    );
    for (const s of res.Successful ?? []) ok.add(s.Id!);
    for (const f of res.Failed ?? []) bad.set(f.Id!, f.Code ?? "Unknown");
  }
  return {
    sent: messages.filter((m) => ok.has(m.id)).map((m) => m.id),
    failed: messages.filter((m) => bad.has(m.id)).map((m) => ({ id: m.id, code: bad.get(m.id)! })),
  };
}
