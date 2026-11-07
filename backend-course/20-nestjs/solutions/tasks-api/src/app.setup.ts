import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HttpErrorFilter } from "./common/http-error.filter";

// כל ההגדרות הגלובליות במקום אחד — main.ts והבדיקות משתמשים באותה פונקציה
export function configureApp(app: INestApplication, { corsOrigins = ["http://localhost:5500"] }: { corsOrigins?: string[] } = {}) {
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableCors({ origin: corsOrigins });
  const config = new DocumentBuilder().setTitle("tasks-api").setDescription("API לניהול משימות").setVersion("1.0").build();
  SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, config));
  return app;
}
