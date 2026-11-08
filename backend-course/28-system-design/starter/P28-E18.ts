// P28-E18: batching של בקשות (כמו DataLoader)
export function createBatcher<K, V>(
  loadMany: (keys: K[]) => Promise<Map<K, V>>,
  options: { maxBatch?: number; waitMs?: number } = {},
): (key: K) => Promise<V | undefined> {
  throw new Error("עוד לא כתבת את הפתרון");
}
