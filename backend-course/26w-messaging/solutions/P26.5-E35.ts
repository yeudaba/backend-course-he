// P26.5-E35: log בזיכרון — partitions, offsets ו־groups
type Entry = { key: string; value: string };

export class MemoryLog {
  #parts: Entry[][];
  #committed = new Map<string, number>();

  constructor(partitions: number) {
    this.#parts = Array.from({ length: partitions }, () => []);
  }
  #partitionOf(key: string) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h += key.charCodeAt(i);
    return h % this.#parts.length;
  }
  append(key: string, value: string) {
    const partition = this.#partitionOf(key);
    const offset = this.#parts[partition].push({ key, value }) - 1;
    return { partition, offset };
  }
  read(group: string, partition: number, max: number) {
    const from = this.#committed.get(`${group}:${partition}`) ?? 0;
    return this.#parts[partition].slice(from, from + max).map((e, i) => ({ offset: from + i, ...e }));
  }
  commit(group: string, partition: number, nextOffset: number) {
    this.#committed.set(`${group}:${partition}`, nextOffset);
  }
  lag(group: string) {
    return this.#parts.reduce((sum, p, i) => sum + p.length - (this.#committed.get(`${group}:${i}`) ?? 0), 0);
  }
}
