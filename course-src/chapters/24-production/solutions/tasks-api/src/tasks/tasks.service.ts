import { Inject, Injectable } from "@nestjs/common";
import { localDate } from "../common/time";
import { HttpError } from "../errors";
import { USERS_REPOSITORY, type UsersRepository } from "../users/users.repository";
import type { TasksRepository } from "./tasks.repository";
import type { CreateTaskInput, ListQuery, UpdateTaskInput } from "./tasks.schema";
import { CLOCK, type Clock, TASKS_REPOSITORY } from "./tasks.tokens";


@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_REPOSITORY) private readonly repo: TasksRepository,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
  ) {}

  // "היום" — לפי אזור הזמן של המשתמש (פרק 24). ב־23:30 UTC, בישראל כבר מחר
  private async todayFor(ownerId: number) {
    const user = await this.users.findById(ownerId);
    return localDate(this.now(), user?.timeZone ?? "UTC");
  }

  private now() {
    return this.clock.now();
  }

  // משימה של משתמש אחר ← 404, לא 403: לא מגלים שהיא בכלל קיימת (שיעור 4)
  async list(ownerId: number, query: ListQuery) {
    return this.repo.list(ownerId, query);
  }

  async get(ownerId: number, id: number) {
    const task = await this.repo.findById(ownerId, id);
    if (!task) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
    return task;
  }

  async create(ownerId: number, input: CreateTaskInput) {
    if (input.dueDate !== null && input.dueDate < (await this.todayFor(ownerId))) {
      throw new HttpError(422, "DUE_DATE_IN_PAST", "תאריך היעד כבר עבר");
    }
    const at = this.now().toISOString();
    return this.repo.insert(ownerId, { ...input, createdAt: at, updatedAt: at });
  }

  async update(ownerId: number, id: number, changes: UpdateTaskInput) {
    const task = await this.repo.update(ownerId, id, { ...changes, updatedAt: this.now().toISOString() });
    if (!task) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
    return task;
  }

  async remove(ownerId: number, id: number) {
    if (!(await this.repo.delete(ownerId, id))) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
  }

  async stats(ownerId: number) {
    return this.repo.stats(ownerId, await this.todayFor(ownerId));
  }
}
