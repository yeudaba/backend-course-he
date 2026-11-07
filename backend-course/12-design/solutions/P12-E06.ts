// P12-E06
export class Counter {
  #count: number;
  #start: number;
  #max: number;

  constructor(start = 0, max = Infinity) {
    this.#start = start;
    this.#max = max;
    this.#count = start;
  }

  get value(): number {
    return this.#count;
  }

  increment(): this {
    this.#count = Math.min(this.#count + 1, this.#max);
    return this;
  }

  reset(): void {
    this.#count = this.#start;
  }
}

const c = new Counter(0, 2);
console.log(c.increment().increment().increment().value);
