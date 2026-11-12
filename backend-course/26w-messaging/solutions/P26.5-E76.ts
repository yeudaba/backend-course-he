// P26.5-E76: batch של 10, במקביל של 3
export async function processBatch<M extends { MessageId: string }>(messages: M[], handler: (m: M) => Promise<void>, concurrency: number) {
  const results: boolean[] = [];
  let next = 0;
  async function worker() {
    while (next < messages.length) {
      const i = next++;
      try {
        await handler(messages[i]);
        results[i] = true;
      } catch {
        results[i] = false;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, messages.length) }, worker));
  return {
    ok: messages.filter((_, i) => results[i]).map((m) => m.MessageId),
    failed: messages.filter((_, i) => !results[i]).map((m) => m.MessageId),
  };
}
