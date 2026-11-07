import type { Task } from "./tasks.schema.ts";

// החוזה של שכבת האחסון. כל המתודות async — כמו שיהיה מול PostgreSQL (פרק 19).
export interface TasksRepository {
  findAll(): Promise<Task[]>;
  findById(id: number): Promise<Task | undefined>;
  insert(data: Omit<Task, "id">): Promise<Task>;
  update(id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined>;
  delete(id: number): Promise<boolean>;
}

export class InMemoryTasksRepository implements TasksRepository {
  #tasks: Task[] = [];
  #nextId = 1;

  async findAll() {
    return this.#tasks.map((t) => ({ ...t }));
  }

  async findById(id: number) {
    const task = this.#tasks.find((t) => t.id === id);
    return task && { ...task };
  }

  async insert(data: Omit<Task, "id">) {
    const task = { id: this.#nextId++, ...data };
    this.#tasks.push(task);
    return { ...task };
  }

  async update(id: number, changes: Partial<Omit<Task, "id">>) {
    const task = this.#tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, changes);
    return { ...task };
  }

  async delete(id: number) {
    const before = this.#tasks.length;
    this.#tasks = this.#tasks.filter((t) => t.id !== id);
    return this.#tasks.length < before;
  }
}
