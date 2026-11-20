// P28.5-E105: מזהים אינסופיים ו־take — מוטנט: לולאת next() ביד, בלי return() — ה־finally של המקור לא רץ
export function* ids(prefix: string, start = 1): Generator<string> {
  let n = start;
  while (true) {
    yield `${prefix}-${n}`;
    n++;
  }
}

export function take<T>(source: Iterable<T>, n: number): T[] {
  const out: T[] = [];
  const it = source[Symbol.iterator]();
  while (out.length < n) {
    const r = it.next();
    if (r.done) break;
    out.push(r.value);
  }
  return out;
}
