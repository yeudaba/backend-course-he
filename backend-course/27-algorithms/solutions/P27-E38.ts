// P27-E38: תור בלי shift
export class FastQueue<T> {
  #items: T[] = [];
  #head = 0;

  push(x: T) {
    this.#items.push(x);
  }
  shift(): T | undefined {
    if (this.#head >= this.#items.length) return undefined;
    const x = this.#items[this.#head];
    this.#items[this.#head++] = undefined as T; // לא להחזיק הפניה
    if (this.#head * 2 >= this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return x;
  }
  peek(): T | undefined {
    return this.#head < this.#items.length ? this.#items[this.#head] : undefined;
  }
  get size() {
    return this.#items.length - this.#head;
  }
}
