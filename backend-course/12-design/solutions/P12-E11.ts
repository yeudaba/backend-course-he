// P12-E11
export class InMemoryRepository<T extends { id: number }> {
  #items = new Map<number, T>();

  async findById(id: number): Promise<T | null> {
    const item = this.#items.get(id);
    return item ? { ...item } : null;
  }

  async findAll(): Promise<T[]> {
    return [...this.#items.values()].sort((a, b) => a.id - b.id).map((x) => ({ ...x }));
  }

  async save(item: T): Promise<void> {
    this.#items.set(item.id, { ...item });
  }

  async delete(id: number): Promise<boolean> {
    return this.#items.delete(id);
  }

  async count(): Promise<number> {
    return this.#items.size;
  }
}

const repo = new InMemoryRepository<{ id: number; name: string }>();
await repo.save({ id: 2, name: "b" });
await repo.save({ id: 1, name: "a" });
console.log(await repo.findAll(), await repo.count());
