import { Module } from "@nestjs/common";
import { TasksController } from "./tasks.controller";
import { PrismaTasksRepository } from "./tasks.prisma-repository";
import { TasksService } from "./tasks.service";
import { CLOCK, TASKS_REPOSITORY } from "./tasks.tokens";

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    { provide: TASKS_REPOSITORY, useClass: PrismaTasksRepository },
    { provide: CLOCK, useValue: { now: () => new Date() } },
  ],
})
export class TasksModule {}
