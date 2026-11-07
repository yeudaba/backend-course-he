// שלב 1 (get/create/update/remove) ושלב 3 (list, stats). לא יודע כלום על HTTP — רק זורק HttpError.
import { HttpError } from "../errors.ts";
import type { TasksRepository } from "./tasks.repository.ts";
import type { CreateTaskInput, ListQuery, Task, UpdateTaskInput } from "./tasks.schema.ts";

export class TasksService {
  repo: TasksRepository;
  now: () => Date;

  constructor(repo: TasksRepository, now: () => Date = () => new Date()) {
    this.repo = repo;
    this.now = now;
  }

  async list(query: ListQuery): Promise<{ data: Task[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    throw new Error("לא מומש");
  }

  async get(id: number): Promise<Task> {
    throw new Error("לא מומש");
  }

  async create(input: CreateTaskInput): Promise<Task> {
    throw new Error("לא מומש");
  }

  async update(id: number, changes: UpdateTaskInput): Promise<Task> {
    throw new Error("לא מומש");
  }

  async remove(id: number): Promise<void> {
    throw new Error("לא מומש");
  }

  async stats(): Promise<{ total: number; byStatus: Record<Task["status"], number>; overdue: number }> {
    throw new Error("לא מומש");
  }
}
