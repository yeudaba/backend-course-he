// P26.5-E37: הודעה פגומה לא חוסמת את התור
export async function processAll<T extends { id: string }>(messages: T[], handler: (m: T) => Promise<void>, maxAttempts: number) {
  const queue = messages.map((msg) => ({ msg, attempts: 0 }));
  const done: string[] = [];
  const dead: { id: string; attempts: number; error: string }[] = [];
  while (queue.length) {
    const item = queue.shift()!;
    try {
      await handler(item.msg);
      done.push(item.msg.id);
    } catch (e) {
      item.attempts++;
      if (item.attempts >= maxAttempts) dead.push({ id: item.msg.id, attempts: item.attempts, error: (e as Error).message });
      else queue.push(item);
    }
  }
  return { done, dead };
}
