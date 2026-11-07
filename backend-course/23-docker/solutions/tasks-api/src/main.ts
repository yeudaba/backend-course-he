import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app, { corsOrigins: process.env.CORS_ORIGINS?.split(",") });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`tasks-api רץ: http://localhost:${process.env.PORT ?? 3000}  (תיעוד: /docs)`);
}
void bootstrap();
