// P28-E93: מלאי בחלקים
export function splitStock(total: number, parts: number): number[] {
  if (!Number.isInteger(parts) || parts <= 0) throw new RangeError("parts חייב להיות שלם חיובי");
  if (!Number.isInteger(total) || total < 0) throw new RangeError("total חייב להיות שלם אי־שלילי");
  const base = Math.floor(total / parts);
  const extra = total % parts;
  return Array.from({ length: parts }, (_, i) => base + (i <= extra ? 1 : 0));
}

export function takeOne(shards: number[], start: number): number {
  const n = shards.length;
  for (let k = 0; k < n; k++) {
    const i = (start + k) % n;
    if (shards[i] > 0) {
      shards[i]--;
      return i;
    }
  }
  return -1;
}
