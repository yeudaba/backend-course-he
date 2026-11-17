// P26.5-E34: תור בזיכרון — ack, nack ונפילה
export class MemoryQueue<T> {
  #queue: T[] = [];
  #unacked = new Map<number, { consumer: string; msg: T }>();
  #nextTag = 1;

  push(msg: T) {
    this.#queue.push(msg);
  }
  size() {
    return this.#queue.length;
  }
  receive(consumer: string) {
    if (this.#queue.length === 0) return null;
    const msg = this.#queue.shift() as T;
    const tag = this.#nextTag++;
    this.#unacked.set(tag, { consumer, msg });
    return { tag, msg };
  }
  #take(tag: number) {
    const e = this.#unacked.get(tag);
    if (!e) throw new Error(`tag לא מוכר: ${tag}`);
    this.#unacked.delete(tag);
    return e;
  }
  ack(tag: number) {
    this.#take(tag);
  }
  nack(tag: number, requeue: boolean) {
    const e = this.#take(tag);
    if (requeue) this.#queue.unshift(e.msg);
  }
  crash(consumer: string) {
    const mine = [...this.#unacked].filter(([, e]) => e.consumer === consumer).sort(([a], [b]) => a - b);
    for (const [tag] of mine) this.#unacked.delete(tag);
    this.#queue.unshift(...mine.map(([, e]) => e.msg));
    return mine.length;
  }
  unacked(consumer: string) {
    return [...this.#unacked.values()].filter((e) => e.consumer === consumer).length;
  }
}
