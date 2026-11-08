import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { loadServerConfig } from "./server-config";

async function bootstrap() {
  const server = loadServerConfig(process.env);
  const app = await NestFactory.create(AppModule);
  configureApp(app, { corsOrigins: server.corsOrigins, trustProxy: server.trustProxy });
  app.enableShutdownHooks();
  await app.listen(server.port, "0.0.0.0");
}
void bootstrap();
