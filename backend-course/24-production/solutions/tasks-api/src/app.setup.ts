import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpErrorFilter } from "./common/http-error.filter";
import { AppLogger } from "./common/logger";
import { requestIdMiddleware } from "./common/request-id.middleware";

// כל ההגדרות הגלובליות במקום אחד — main.ts והבדיקות משתמשים באותה פונקציה
export function configureApp(
  app: INestApplication,
  { corsOrigins = ["http://localhost:5500"], trustProxy = false }: { corsOrigins?: string[]; trustProxy?: boolean | number } = {},
) {
  // מאחורי reverse proxy (nginx, פלטפורמת פריסה): req.ip מה־X-Forwarded-For — רק כשאומרים במפורש שסומכים עליו
  app.getHttpAdapter().getInstance().set("trust proxy", trustProxy);
  // ראשון: לכל בקשה requestId ושורת לוג
  app.use(requestIdMiddleware(app.get(AppLogger)));
  app.useGlobalFilters(new HttpErrorFilter());
  // exposedHeaders: בלי זה, JavaScript בדפדפן לא יכול לקרוא את ה־headers האלה מהתשובה (CORS)
  app.enableCors({ origin: corsOrigins, exposedHeaders: ["X-Request-Id", "Retry-After", "Idempotent-Replayed"] });
  const config = new DocumentBuilder()
    .setTitle("tasks-api")
    .setDescription("API לניהול משימות. התחבר ב־POST /auth/login, ולחץ Authorize עם ה־accessToken")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, config));
  return app;
}
