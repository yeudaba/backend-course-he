import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";
import { AppLogger } from "./common/logger";
import { loadServerConfig } from "./server-config";

async function bootstrap() {
  // קודם ההגדרות: הגדרה שגויה ← השרת לא עולה, עם הודעה ברורה (ובפלטפורמה — ה־deploy נכשל, והגרסה הקודמת נשארת)
  const server = loadServerConfig(process.env);
  // bufferLogs: ההודעות של Nest בזמן העלייה נכתבות דרך AppLogger (כ־JSON) ולא בפורמט שלו
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  app.useLogger(logger);
  // TRUST_PROXY = כמה proxies מוכרים יש לפני השרת. ב־Render: 1
  configureApp(app, { corsOrigins: server.corsOrigins, trustProxy: server.trustProxy });
  // SIGTERM (docker stop, deploy חדש): Nest מפסיק לקבל בקשות, מסיים את מה שבאמצע, וסוגר את Prisma
  app.enableShutdownHooks();
  // הפלטפורמה קובעת את ה־port (Render: PORT=10000) — לכן מה־env, וב־0.0.0.0
  await app.listen(server.port, "0.0.0.0");
  logger.info("server started", { port: server.port, production: server.production });
}
void bootstrap();
