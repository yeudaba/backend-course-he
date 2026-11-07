// P20-E20: שלוש תקלות — POST /tasks ← 500, GET /health ← 404, GET /tasks/1 ← 404 גם כשהמשימה קיימת
import { Body, Controller, Get, Injectable, Module, NotFoundException, Param, Post } from "@nestjs/common";

@Injectable()
export class ClockService {
  now() {
    return new Date();
  }
}

export interface Task {
  id: number;
  title: string;
  createdAt: string;
}

export class TasksService {
  private readonly tasks: Task[] = [];

  constructor(private readonly clock: ClockService) {}

  create(title: string): Task {
    const task = { id: this.tasks.length + 1, title, createdAt: this.clock.now().toISOString() };
    this.tasks.push(task);
    return task;
  }

  findOne(id: number): Task {
    const task = this.tasks.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`משימה ${id} לא נמצאה`);
    return task;
  }
}

@Controller("tasks")
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post()
  create(@Body() body: { title: string }) {
    return this.tasks.create(body.title);
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.tasks.findOne(id);
  }
}

@Controller("health")
export class HealthController {
  @Get()
  health() {
    return { status: "ok" };
  }
}

@Module({
  controllers: [TasksController],
  providers: [TasksService, ClockService],
})
export class TasksModule {}
