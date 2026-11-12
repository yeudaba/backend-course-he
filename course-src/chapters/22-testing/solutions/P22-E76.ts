// P22-E76 — הקוד שבודקים (לא משנים אותו). service רגיל, כמו ב־Nest — בלי ה־decorator
export class HttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type Task = { id: number; ownerId: number; title: string; done: boolean; dueDate: string | null };

export class InMemoryTasksRepository {
  #tasks: Task[] = [];
  #nextId = 1;
  async insert(data: Omit<Task, "id">): Promise<Task> {
    const task = { id: this.#nextId++, ...data };
    this.#tasks.push(task);
    return { ...task };
  }
  async findById(id: number): Promise<Task | undefined> {
    const task = this.#tasks.find((t) => t.id === id);
    return task && { ...task };
  }
  async update(id: number, changes: Partial<Omit<Task, "id">>): Promise<Task | undefined> {
    const task = this.#tasks.find((t) => t.id === id);
    if (!task) return undefined;
    Object.assign(task, changes);
    return { ...task };
  }
}

export class TasksService {
  readonly #repo: InMemoryTasksRepository;
  readonly #clock: { now(): Date };
  constructor(repo: InMemoryTasksRepository, clock: { now(): Date }) {
    this.#repo = repo;
    this.#clock = clock;
  }

  async create(ownerId: number, input: { title: string; dueDate?: string | null }): Promise<Task> {
    const title = input.title.trim();
    if (!title) throw new HttpError(400, "TITLE_REQUIRED", "חובה כותרת");
    const today = this.#clock.now().toISOString().slice(0, 10);
    const dueDate = input.dueDate ?? null;
    if (dueDate !== null && dueDate < today) throw new HttpError(422, "DUE_DATE_IN_PAST", "תאריך היעד כבר עבר");
    return this.#repo.insert({ ownerId, title, done: false, dueDate });
  }

  async complete(ownerId: number, id: number): Promise<Task> {
    const task = await this.#repo.findById(id);
    if (!task || task.ownerId !== ownerId) throw new HttpError(404, "TASK_NOT_FOUND", `משימה ${id} לא נמצאה`);
    return (await this.#repo.update(id, { done: true }))!;
  }
}
