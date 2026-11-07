// P20-E20: מתוקן
import { Body, Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post } from "@nestjs/common";

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

@Injectable() // ← תקלה 1: בלי decorator אין design:paramtypes, ו־Nest יוצר את המחלקה בלי ClockService
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
  findOne(@Param("id", ParseIntPipe) id: number) { // ← תקלה 3: בלי ParseIntPipe, id הוא "1" ו־"1" !== 1
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
  controllers: [TasksController, HealthController], // ← תקלה 2: HealthController לא היה רשום
  providers: [TasksService, ClockService],
})
export class TasksModule {}
