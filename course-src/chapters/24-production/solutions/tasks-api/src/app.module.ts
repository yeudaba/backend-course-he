import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ObservabilityModule } from "./common/observability.module";
import { ConfigModule } from "./config";
import { HealthController } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [ConfigModule, ObservabilityModule, PrismaModule, AuthModule, TasksModule],
  controllers: [HealthController],
})
export class AppModule {}
