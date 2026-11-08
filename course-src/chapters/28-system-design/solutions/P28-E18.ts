// P28-E18
// batching: הרבה בקשות "תביא את X" באותו רגע ← שאילתה אחת עם כולם (כמו DataLoader מול N+1)
export function createBatcher<K, V>(
  loadMany: (keys: K[]) => Promise<Map<K, V>>,
  { maxBatch = 100, waitMs = 0 }: { maxBatch?: number; waitMs?: number } = {},
) {
  let queue: { key: K; resolve: (v: V | undefined) => void; reject: (e: unknown) => void }[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    const batch = queue;
    queue = [];
    const keys = [...new Set(batch.map((b) => b.key))];
    loadMany(keys).then(
      (result) => batch.forEach((b) => b.resolve(result.get(b.key))),
      (err) => batch.forEach((b) => b.reject(err)),
    );
  };

  return (key: K) =>
    new Promise<V | undefined>((resolve, reject) => {
      queue.push({ key, resolve, reject });
      if (new Set(queue.map((q) => q.key)).size >= maxBatch) flush();
      else if (!timer) timer = setTimeout(flush, waitMs);
    });
}
