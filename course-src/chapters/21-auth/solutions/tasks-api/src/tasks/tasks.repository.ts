import type { ListQuery, Task } from "./tasks.schema";

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
// פרק 21: כל פעולה מקבלת ownerId — ה־repository פשוט לא יודע להחזיר משימה של מישהו אחר.
export interface TasksRepository {
  list(ownerId: number, query: ListQuery): Promise<TaskPage>;
  stats(ownerId: number, today: string): Promise<TaskStats>;
  findById(ownerId: number, id: number): Promise<Task | undefined>;
  insert(ownerId: number, data: Omit<Task, "id">): Promise<Task>;
  update(ownerId: number, id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined>;
  delete(ownerId: number, id: number): Promise<boolean>;
}

type StoredTask = Task & { ownerId: number };
const strip = ({ ownerId, ...task }: StoredTask): Task => task;

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

export class InMemoryTasksRepository implements TasksRepository {
  #tasks: StoredTask[] = [];
  #nextId = 1;

  async list(ownerId: number, { status, priority, q, sort, page, limit }: ListQuery) {
    const all = this.#tasks.filter(
      (t) =>
        t.ownerId === ownerId &&
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
      data: sorted.slice(start, start + limit).map(strip),
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    };
  }

  async stats(ownerId: number, today: string) {
    const mine = this.#tasks.filter((t) => t.ownerId === ownerId);
    const byStatus: Record<Task["status"], number> = { todo: 0, in_progress: 0, done: 0 };
    for (const t of mine) byStatus[t.status]++;
    const overdue = mine.filter((t) => t.status !== "done" && t.dueDate !== null && t.dueDate < today).length;
    return { total: mine.length, byStatus, overdue };
  }

  async findById(ownerId: number, id: number) {
    const task = this.#tasks.find((t) => t.id === id && t.ownerId === ownerId);
    return task && strip(task);
  }

  async insert(ownerId: number, data: Omit<Task, "id">) {
    const task = { id: this.#nextId++, ...data, ownerId };
    this.#tasks.push(task);
    return strip(task);
  }

  async update(ownerId: number, id: number, changes: Partial<Omit<Task, "id">>) {
    const task = this.#tasks.find((t) => t.id === id && t.ownerId === ownerId);
    if (!task) return undefined;
    Object.assign(task, changes);
    return strip(task);
  }

  async delete(ownerId: number, id: number) {
    const before = this.#tasks.length;
    this.#tasks = this.#tasks.filter((t) => !(t.id === id && t.ownerId === ownerId));
    return this.#tasks.length < before;
  }
}
