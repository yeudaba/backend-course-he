// P28.5-E105: מזהים אינסופיים ו־take — מוטנט: בודק את האורך לפני ה־push, ולוקח איבר מיותר
export function* ids(prefix: string, start = 1): Generator<string> {
  let n = start;
  while (true) {
    yield `${prefix}-${n}`;
    n++;
  }
}

export function take<T>(source: Iterable<T>, n: number): T[] {
  const out: T[] = [];
  for (const x of source) {
    if (out.length >= n) break;
    out.push(x);
  }
  return out;
}
