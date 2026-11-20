// P28.5-E64: batches מזרם
export async function* batches<T>(source: AsyncIterable<T> | Iterable<T>, size: number): AsyncGenerator<T[]> {
  if (!Number.isInteger(size) || size < 0) throw new RangeError("size חייב להיות שלם חיובי");
  let buf: T[] = [];
  for await (const x of source) {
    buf.push(x);
    if (buf.length === size) {
      yield buf;
      buf = [];
    }
  }
  if (buf.length) yield buf;
}
