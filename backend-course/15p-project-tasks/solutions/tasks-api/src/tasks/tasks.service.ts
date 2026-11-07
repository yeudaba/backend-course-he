import { HttpError } from "../errors.ts";
import type { TasksRepository } from "./tasks.repository.ts";
import type { CreateTaskInput, ListQuery, Task, UpdateTaskInput } from "./tasks.schema.ts";

const PRIORITY_RANK = { low: 1, medium: 2, high: 3 };

// "היום" לפי UTC, בפורמט YYYY-MM-DD (אזורי זמן — פרק 24)
const today = (now: Date) => now.toISOString().slice(0, 10);

export class TasksService {
  repo: TasksRepository;
  now: () => Date;

  constructor(repo: TasksRepository, now: () => Date = () => new Date()) {
    this.repo = repo;
    this.now = now;
  }

  async list(query: ListQuery) {
    const { status, priority, q, sort, page, limit } = query;
    const all = (await this.repo.findAll()).filter(
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
      return (desc ? -diff : diff) || a.id - b.id; // שוויון — לפי id עולה, כדי שהסדר יהיה יציב
    });
    const start = (page - 1) * limit;
    return {
      data: sorted.slice(start, start + limit),
      meta: { page, limit, total: all.length, totalPages: Math.ceil(all.length / limit) },
    };
  }

  async get(id: number) {
    const task = await this.repo.findById(id);
    if (!task) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
    return task;
  }

  async create(input: CreateTaskInput) {
    if (input.dueDate !== null && input.dueDate < today(this.now())) {
      throw new HttpError(422, "DUE_DATE_IN_PAST", "תאריך היעד כבר עבר");
    }
    const at = this.now().toISOString();
    return this.repo.insert({ ...input, createdAt: at, updatedAt: at });
  }

  async update(id: number, changes: UpdateTaskInput) {
    const task = await this.repo.update(id, { ...changes, updatedAt: this.now().toISOString() });
    if (!task) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
    return task;
  }

  async remove(id: number) {
    if (!(await this.repo.delete(id))) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
  }

  async stats() {
    const all = await this.repo.findAll();
    const byStatus: Record<Task["status"], number> = { todo: 0, in_progress: 0, done: 0 };
    for (const t of all) byStatus[t.status]++;
    const day = today(this.now());
    const overdue = all.filter((t) => t.status !== "done" && t.dueDate !== null && t.dueDate < day).length;
    return { total: all.length, byStatus, overdue };
  }
}
