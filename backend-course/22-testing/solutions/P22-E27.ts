// P22-E27: מטמון LRU עם Map
export class LruCache<K, V> {
  #items = new Map<K, V>();
  #capacity: number;

  constructor(capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new RangeError("capacity חייב להיות מספר שלם חיובי");
    this.#capacity = capacity;
  }

  get(key: K): V | undefined {
    if (!this.#items.has(key)) return undefined;
    const value = this.#items.get(key) as V;
    // "נגיעה": מוציאים ומכניסים מחדש — עכשיו הוא האחרון בסדר של ה־Map
    this.#items.delete(key);
    this.#items.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.#items.delete(key);
    this.#items.set(key, value);
    if (this.#items.size > this.#capacity) {
      const oldest = this.#items.keys().next().value as K;
      this.#items.delete(oldest);
    }
  }

  get size(): number {
    return this.#items.size;
  }

  keys(): K[] {
    return [...this.#items.keys()];
  }
}

const cache = new LruCache<string, number>(2);
cache.set("a", 1);
cache.set("b", 2);
cache.get("a"); // a נהיה "האחרון שנגעו בו"
cache.set("c", 3); // אין מקום — b יוצא
console.log(cache.keys(), cache.get("b"), cache.size);
