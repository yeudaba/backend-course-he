// P21-E90: repository בזיכרון — ownerId בפנים, לא בחוץ
export type Task = { id: number; title: string; done: boolean };
type StoredTask = Task & { ownerId: number };

const strip = ({ ownerId, ...task }: StoredTask): Task => task;

export class InMemoryTasksRepository {
  #tasks: StoredTask[] = [];
  #nextId = 1;

  #find(ownerId: number, id: number) {
    return this.#tasks.find((t) => t.id === id && t.ownerId === ownerId);
  }

  insert(ownerId: number, data: { title: string; done?: boolean }): Task {
    const task: StoredTask = { id: this.#nextId++, title: data.title, done: data.done ?? false, ownerId };
    this.#tasks.push(task);
    return strip(task);
  }

  list(ownerId: number): Task[] {
    return this.#tasks.filter((t) => t.ownerId === ownerId).map(strip);
  }

  findById(ownerId: number, id: number): Task | undefined {
    const t = this.#find(ownerId, id);
    return t && strip(t);
  }

  update(ownerId: number, id: number, changes: Partial<Omit<Task, "id">>): Task | undefined {
    const t = this.#find(ownerId, id);
    if (!t) return undefined;
    if (changes.title !== undefined) t.title = changes.title;
    if (changes.done !== undefined) t.done = changes.done;
    return strip(t);
  }

  delete(ownerId: number, id: number): boolean {
    const i = this.#tasks.findIndex((t) => t.id === id && t.ownerId === ownerId);
    if (i === -1) return false;
    this.#tasks.splice(i, 1);
    return true;
  }
}
