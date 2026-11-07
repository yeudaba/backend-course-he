// P12-E17
export interface Repo<T extends { id: number }> {
  findById(id: number): Promise<T | null>;
  save(item: T): Promise<void>;
}

export class CachedRepository<T extends { id: number }> implements Repo<T> {
  #inner: Repo<T>;
  #cache = new Map<number, T | null>();
  #hits = 0;
  #misses = 0;

  constructor(inner: Repo<T>) {
    this.#inner = inner;
  }

  get hits(): number {
    return this.#hits;
  }
  get misses(): number {
    return this.#misses;
  }

  async findById(id: number): Promise<T | null> {
    if (this.#cache.has(id)) {
      this.#hits++;
      const cached = this.#cache.get(id) ?? null;
      return cached ? { ...cached } : null;
    }
    this.#misses++;
    const item = await this.#inner.findById(id);
    this.#cache.set(id, item ? { ...item } : null);
    return item;
  }

  async save(item: T): Promise<void> {
    await this.#inner.save(item);
    this.#cache.set(item.id, { ...item });
  }
}

const calls: number[] = [];
const slow: Repo<{ id: number; v: string }> = {
  async findById(id) {
    calls.push(id);
    return id === 1 ? { id: 1, v: "a" } : null;
  },
  async save() {},
};
const repo = new CachedRepository(slow);
await repo.findById(1);
await repo.findById(1);
await repo.findById(2);
await repo.findById(2);
console.log(repo.hits, repo.misses, calls);
