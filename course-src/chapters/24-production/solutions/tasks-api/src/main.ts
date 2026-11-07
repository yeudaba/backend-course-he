import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { AppLogger } from "./common/logger";

async function bootstrap() {
  // bufferLogs: ההודעות של Nest בזמן העלייה נכתבות דרך AppLogger (כ־JSON) ולא בפורמט שלו
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  // TRUST_PROXY = כמה proxies מוכרים יש לפני השרת (פרק 25). בלי — לא סומכים על X-Forwarded-For בכלל
  const proxies = Number(process.env.TRUST_PROXY ?? 0);
  configureApp(app, { corsOrigins: process.env.CORS_ORIGINS?.split(","), trustProxy: proxies > 0 ? proxies : false });
  // SIGTERM (docker stop, פריסה חדשה): Nest מפסיק לקבל בקשות, מסיים את מה שבאמצע, וסוגר את Prisma
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  logger.info("server started", { port, docs: "/docs" });
}
void bootstrap();
