// P12-E35: רשימת משימות
export type Todo = { id: number; title: string; done: boolean };

export class TodoList {
  #items: Todo[] = [];
  #nextId = 1;

  add(title: string): number {
    const t = title.trim();
    if (t === "") throw new Error("כותרת ריקה");
    const id = this.#nextId++;
    this.#items.push({ id, title: t, done: false });
    return id;
  }

  complete(id: number): void {
    const item = this.#items.find((t) => t.id === id);
    if (!item) throw new Error(`משימה ${id} לא קיימת`);
    item.done = true;
  }

  remove(id: number): boolean {
    const before = this.#items.length;
    this.#items = this.#items.filter((t) => t.id !== id);
    return this.#items.length < before;
  }

  get pending(): string[] {
    return this.#items.filter((t) => !t.done).map((t) => t.title);
  }

  all(): Todo[] {
    return this.#items.map((t) => ({ ...t }));
  }
}

const list = new TodoList();
const milk = list.add(" לקנות חלב ");
list.add("לשלם חשבון");
list.complete(milk);
console.log(list.pending, list.remove(milk), list.add("לצלצל"));
console.log(list.all());
