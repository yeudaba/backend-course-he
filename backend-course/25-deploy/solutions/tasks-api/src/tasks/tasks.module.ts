import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaIdempotencyRepository } from "../idempotency/idempotency.prisma-repository";
import { IDEMPOTENCY_REPOSITORY } from "../idempotency/idempotency.repository";
import { IdempotencyService } from "../idempotency/idempotency.service";
import { TasksController } from "./tasks.controller";
import { PrismaTasksRepository } from "./tasks.prisma-repository";
import { TasksService } from "./tasks.service";
import { TASKS_REPOSITORY } from "./tasks.tokens";

@Module({
  imports: [AuthModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    IdempotencyService,
    { provide: IDEMPOTENCY_REPOSITORY, useClass: PrismaIdempotencyRepository },
    { provide: TASKS_REPOSITORY, useClass: PrismaTasksRepository },
  ],
})
export class TasksModule {}
