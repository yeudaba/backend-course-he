// P20-E77: stats לפני :id
import { Controller, Get, Module, NotFoundException, Param, ParseIntPipe } from "@nestjs/common";

const TASKS = [
  { id: 1, done: true },
  { id: 2, done: false },
  { id: 3, done: true },
  { id: 4, done: false },
];

@Controller("tasks")
export class TasksController {
  @Get("stats")
  stats() {
    return { total: TASKS.length, done: TASKS.filter((t) => t.done).length };
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    const task = TASKS.find((t) => t.id === id);
    if (!task) throw new NotFoundException(`משימה ${id} לא נמצאה`);
    return task;
  }
}

@Module({ controllers: [TasksController] })
export class TasksModule {}
