// P28-E64: מונה קליקים שנשפך באצווה
export class ClickBuffer {
  private counts = new Map<string, number>();
  private total = 0;
  private maxPending: number;

  constructor(maxPending = 10_000) {
    this.maxPending = maxPending;
  }

  click(code: string): boolean {
    this.counts.set(code, (this.counts.get(code) ?? 0) + 1);
    this.total++;
    return this.total >= this.maxPending;
  }

  pending(): number {
    return this.total;
  }

  flush(): [string, number][] {
    const out = [...this.counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    this.counts = new Map();
    this.total = 0;
    return out;
  }
}
