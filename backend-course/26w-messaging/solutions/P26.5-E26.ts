// P26.5-E26 — להחזיר סדר להודעות
export type PushResult = "delivered" | "buffered" | "duplicate";

export class ReorderBuffer<T> {
  #next: number;
  #waiting = new Map<number, T>();
  #deliver: (seq: number, message: T) => void;

  constructor(deliver: (seq: number, message: T) => void, startSeq = 1) {
    this.#deliver = deliver;
    this.#next = startSeq;
  }

  push(seq: number, message: T): PushResult {
    if (!Number.isInteger(seq)) throw new TypeError(`seq חייב להיות מספר שלם: ${seq}`);
    if (seq < this.#next || this.#waiting.has(seq)) return "duplicate";
    if (seq > this.#next) {
      this.#waiting.set(seq, message);
      return "buffered";
    }
    this.#deliver(seq, message);
    this.#next++;
    while (this.#waiting.has(this.#next)) {
      const waiting = this.#waiting.get(this.#next) as T;
      this.#waiting.delete(this.#next);
      this.#deliver(this.#next, waiting);
      this.#next++;
    }
    return "delivered";
  }

  get nextSeq(): number {
    return this.#next;
  }

  get pending(): number {
    return this.#waiting.size;
  }

  gaps(): number[] {
    if (this.#waiting.size === 0) return [];
    const max = Math.max(...this.#waiting.keys());
    const missing: number[] = [];
    for (let seq = this.#next; seq < max; seq++) if (!this.#waiting.has(seq)) missing.push(seq);
    return missing;
  }
}

const buffer = new ReorderBuffer<string>((seq, status) => console.log(`  ← ${seq}: ${status}`));
for (const [seq, status] of [[1, "placed"], [3, "shipped"], [5, "refunded"], [3, "shipped"], [2, "paid"], [1, "placed"]] as const) {
  const result = buffer.push(seq, status);
  console.log(`push ${seq} → ${result}`, result === "buffered" ? `(חסר: ${buffer.gaps().join(", ")})` : "");
}
console.log("next:", buffer.nextSeq, "pending:", buffer.pending);
