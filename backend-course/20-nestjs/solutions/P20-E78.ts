// P20-E78: אפליקציה לבדיקות — createTestApp
import { Controller, Get, Inject, Injectable, Module } from "@nestjs/common";
import { Test } from "@nestjs/testing";

export const CLOCK = "CLOCK";
export const TASKS = "TASKS";
export type Task = { id: number; title: string; dueDate: string | null; done: boolean };

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS) private readonly tasks: Task[],
    @Inject(CLOCK) private readonly clock: { now(): Date },
  ) {}

  overdue() {
    const today = this.clock.now().toISOString().slice(0, 10);
    return this.tasks
      .filter((t) => !t.done && t.dueDate !== null && t.dueDate < today)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  }
}

@Controller("tasks")
export class TasksController {
  constructor(private readonly service: TasksService) {}
  @Get("overdue")
  overdue() {
    return this.service.overdue();
  }
}

@Module({
  controllers: [TasksController],
  providers: [TasksService, { provide: TASKS, useValue: [] }, { provide: CLOCK, useValue: { now: () => new Date() } }],
})
export class TasksModule {}

export async function createTestApp({ now, tasks }: { now: Date; tasks: Task[] }) {
  const moduleRef = await Test.createTestingModule({ imports: [TasksModule] })
    .overrideProvider(CLOCK)
    .useValue({ now: () => now })
    .overrideProvider(TASKS)
    .useValue(tasks)
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  await app.init();
  return app;
}
