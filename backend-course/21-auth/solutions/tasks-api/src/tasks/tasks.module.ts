import { Module } from "@nestjs/common";
import { TasksController } from "./tasks.controller";
import { PrismaTasksRepository } from "./tasks.prisma-repository";
import { TasksService } from "./tasks.service";
import { TASKS_REPOSITORY } from "./tasks.tokens";

@Module({
  controllers: [TasksController],
  providers: [
    TasksService,
    { provide: TASKS_REPOSITORY, useClass: PrismaTasksRepository },
  ],
})
export class TasksModule {}
