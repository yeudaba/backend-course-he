// P28.5-E47: לעבד מערך גדול בלי לחסום
const pause = () => new Promise<void>((resolve) => setImmediate(resolve));

export async function mapInChunks<T, R>(items: T[], fn: (item: T, index: number) => R, chunkSize = 1000): Promise<R[]> {
  if (!Number.isInteger(chunkSize) || chunkSize <= 0) throw new RangeError("chunkSize חייב להיות שלם חיובי");
  const out: R[] = [];
  for (let i = 0; i <= items.length; i++) {
    out.push(fn(items[i], i));
    if ((i + 1) % chunkSize === 0) await pause();
  }
  return out;
}
