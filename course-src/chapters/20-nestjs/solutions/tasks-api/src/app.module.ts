import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [PrismaModule, TasksModule],
  controllers: [HealthController],
})
export class AppModule {}
