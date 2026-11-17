// P27-E95: heap — k הגדולים מתוך זרם
export class MinHeap {
  #a: number[] = [];

  get size() {
    return this.#a.length;
  }
  peek() {
    return this.#a[0];
  }
  push(x: number) {
    const a = this.#a;
    a.push(x);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p] <= a[i]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.#a;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l] < a[m]) m = l;
        if (r < a.length && a[r] < a[m]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}

export function topK(values: Iterable<number>, k: number): number[] {
  if (k <= 0) return [];
  const heap = new MinHeap();
  for (const x of values) {
    if (heap.size < k) heap.push(x);
    else if (x > heap.peek()!) {
      heap.pop();
      heap.push(x);
    }
  }
  const out: number[] = [];
  while (heap.size) out.push(heap.pop()!);
  return out.reverse();
}
