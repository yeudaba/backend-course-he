// P28.5-E104: חתיכות מכל iterable — מוטנט: טוען את כל המקור למערך ואז slice
export function* chunk<T>(source: Iterable<T>, size: number): Generator<T[]> {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size חייב להיות מספר שלם חיובי, קיבלתי ${size}`);
  const all = [...source];
  for (let i = 0; i < all.length; i += size) yield all.slice(i, i + size);
}
