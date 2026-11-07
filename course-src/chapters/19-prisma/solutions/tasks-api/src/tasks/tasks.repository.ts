import type { ListQuery, Task } from "./tasks.schema.ts";

export interface TaskPage {
  data: Task[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface TaskStats {
  total: number;
  byStatus: Record<Task["status"], number>;
  overdue: number;
}

// החוזה של שכבת האחסון. סינון, מיון ו־pagination כאן — כדי שמסד הנתונים יעשה אותם (פרק 19).
export interface TasksRepository {
  list(query: ListQuery): Promise<TaskPage>;
  stats(today: string): Promise<TaskStats>;
  findById(id: number): Promise<Task | undefined>;
  insert(data: Omit<Task, "id">): Promise<Task>;
  update(id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined>;
  delete(id: number): Promise<boolean>;
}

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

export class InMemoryTasksRepository implements TasksRepository {
  #tasks: Task[] = [];
  #nextId = 1;

  async list({ status, priority, q, sort, page, limit }: ListQuery) {
    const all = this.#tasks.filter(
      (t) =>
        (!status || t.status === status) &&
        (!priority || t.priority === priority) &&
        (!q || `${t.title} ${t.description ?? ""}`.toLowerCase().includes(q.toLowerCase()))
    );
    const desc = sort.startsWith("-");
    const field = (desc ? sort.slice(1) : sort) as "createdAt" | "dueDate" | "priority";
    const sorted = all.sort((a, b) => {
      // משימות בלי dueDate תמיד בסוף, בכל כיוון מיון
      if (field === "dueDate" && (a.dueDate === null || b.dueDate === null)) {
        return (a.dueDate === null ? 1 : 0) - (b.dueDate === null ? 1 : 0) || a.id - b.id;
      }
      const diff =
        field === "priority"
          ? PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
          : String(a[field]).localeCompare(String(b[field]));
      return (desc ? -diff : diff) || a.id - b.id;
    });
    const start = (page - 1) * limit;
    return {
      data: sorted.slice(start, start + limit).map((t) => ({ ...t })),
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    };
  }

  async stats(today: string) {
    const byStatus: Record<Task["status"], number> = { todo: 0, in_progress: 0, done: 0 };
    for (const t of this.#tasks) byStatus[t.status]++;
    const overdue = this.#tasks.filter((t) => t.status !== "done" && t.dueDate !== null && t.dueDate < today).length;
    return { total: this.#tasks.length, byStatus, overdue };
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
