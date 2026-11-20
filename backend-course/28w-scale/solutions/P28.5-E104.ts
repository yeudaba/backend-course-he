// P28.5-E104: חתיכות מכל iterable
export function* chunk<T>(source: Iterable<T>, size: number): Generator<T[]> {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size חייב להיות מספר שלם חיובי, קיבלתי ${size}`);
  let buf: T[] = [];
  for (const x of source) {
    buf.push(x);
    if (buf.length === size) {
      yield buf;
      buf = [];
    }
  }
  if (buf.length > 0) yield buf;
}
