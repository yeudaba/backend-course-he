// P28.5-E26 — הנפוצים ביותר בזרם, בזיכרון קבוע (Space-Saving)
export type Counted<T> = { item: T; count: number; error: number };

export class TopK<T> {
  #k: number;
  #counters = new Map<T, { count: number; error: number }>();
  #seen = 0;

  constructor(k: number) {
    if (!Number.isInteger(k) || k < 1) throw new RangeError("k חייב להיות מספר שלם חיובי");
    this.#k = k;
  }

  add(item: T): void {
    this.#seen++;
    const counter = this.#counters.get(item);
    if (counter) {
      counter.count++;
      return;
    }
    if (this.#counters.size < this.#k) {
      this.#counters.set(item, { count: 1, error: 0 });
      return;
    }
    // מחליפים את המונה הקטן ביותר: החדש "יורש" את הספירה שלו (וזו גם הטעות האפשרית)
    let minItem: T | undefined;
    let min = Infinity;
    for (const [key, c] of this.#counters) {
      if (c.count < min) {
        min = c.count;
        minItem = key;
      }
    }
    this.#counters.delete(minItem as T);
    this.#counters.set(item, { count: min + 1, error: min });
  }

  get seen(): number {
    return this.#seen;
  }

  top(n = this.#k): Counted<T>[] {
    return [...this.#counters]
      .map(([item, c]) => ({ item, count: c.count, error: c.error }))
      .sort((a, b) => b.count - a.count || String(a.item).localeCompare(String(b.item)))
      .slice(0, n);
  }
}

// זרם של 100,000 בקשות: 3 נתיבים "חמים" ו־5,000 נתיבים שמופיעים מעט
let seed = 1;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
const topk = new TopK<string>(20);
const truth = new Map<string, number>();
for (let i = 0; i < 100_000; i++) {
  const r = rand();
  const path = r < 0.2 ? "/products" : r < 0.3 ? "/cart" : r < 0.35 ? "/checkout" : `/products/${Math.floor(rand() * 5000)}`;
  topk.add(path);
  truth.set(path, (truth.get(path) ?? 0) + 1);
}
for (const { item, count, error } of topk.top(4)) {
  console.log(item.padEnd(16), String(count).padStart(6), `(אמיתי: ${truth.get(item)}, טעות עד ${error})`);
}
console.log("seen:", topk.seen, "· מונים בזיכרון: 20 במקום", truth.size);
