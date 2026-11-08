import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import { HttpErrorFilter } from "./common/http-error.filter";

export function configureApp(app: INestApplication, { corsOrigins = ["http://localhost:5500"], trustProxy = false }: { corsOrigins?: string[]; trustProxy?: number | false } = {}) {
  const express = app.getHttpAdapter().getInstance();
  express.set("trust proxy", trustProxy);
  express.disable("x-powered-by");
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (req.secure) res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    next();
  });
  app.useGlobalFilters(new HttpErrorFilter());
  app.enableCors({ origin: corsOrigins, exposedHeaders: ["Idempotent-Replayed"] });
  const config = new DocumentBuilder()
    .setTitle("coffee-shop")
    .setDescription("חנות ציוד קפה: מוצרים, עגלה, הזמנות ותשלום מדומה. התחבר ב־POST /auth/login ולחץ Authorize. כרטיס לבדיקה: 4242424242424242 (נדחה: 4000000000000002)")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, () => SwaggerModule.createDocument(app, config));
  return app;
}
