import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { ObservabilityModule } from "./common/observability.module";
import { ConfigModule } from "./config";
import { BUILD_INFO, HealthController, readBuildInfo } from "./health.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { TasksModule } from "./tasks/tasks.module";

@Module({
  imports: [ConfigModule, ObservabilityModule, PrismaModule, AuthModule, TasksModule],
  controllers: [HealthController],
  providers: [{ provide: BUILD_INFO, useFactory: () => readBuildInfo() }],
})
export class AppModule {}
