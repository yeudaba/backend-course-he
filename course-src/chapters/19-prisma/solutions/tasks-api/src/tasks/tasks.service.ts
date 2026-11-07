import { HttpError } from "../errors.ts";
import type { TasksRepository } from "./tasks.repository.ts";
import type { CreateTaskInput, ListQuery, UpdateTaskInput } from "./tasks.schema.ts";

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
    return this.repo.list(query);
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
    return this.repo.stats(today(this.now()));
  }
}
