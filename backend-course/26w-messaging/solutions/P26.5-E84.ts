// P26.5-E84: dedupe עם חלון — לזכור רק את האחרונים
export class RecentIds {
  #ids = new Set<string>();
  #max: number;
  constructor(max: number) {
    this.#max = max;
  }

  seen(id: string) {
    if (this.#ids.has(id)) return true;
    this.#ids.add(id);
    if (this.#ids.size > this.#max) this.#ids.delete(this.#ids.values().next().value as string);
    return false;
  }

  get size() {
    return this.#ids.size;
  }
}
