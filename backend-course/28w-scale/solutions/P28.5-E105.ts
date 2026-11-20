// P28.5-E105: מזהים אינסופיים ו־take
export function* ids(prefix: string, start = 1): Generator<string> {
  let n = start;
  while (true) {
    yield `${prefix}-${n}`;
    n++;
  }
}

export function take<T>(source: Iterable<T>, n: number): T[] {
  const out: T[] = [];
  if (n <= 0) return out;
  for (const x of source) {
    out.push(x);
    if (out.length >= n) break;
  }
  return out;
}
