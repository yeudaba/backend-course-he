// P21-E92: Swagger — Bearer על מה שמוגן
import { Controller, Get, INestApplication, Module } from "@nestjs/common";
import { ApiBearerAuth, DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

@ApiBearerAuth()
@Controller("tasks")
export class TasksController {
  @Get()
  list() {
    return [];
  }
}

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return { ok: true };
  }
}

@Module({ controllers: [TasksController, HealthController] })
export class AppModule {}

export function createDocument(app: INestApplication) {
  const config = new DocumentBuilder().setTitle("tasks-api").setVersion("1.0").addBearerAuth().build();
  return SwaggerModule.createDocument(app, config);
}
