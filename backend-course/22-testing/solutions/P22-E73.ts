// P22-E73: createTestApp — אפליקציית Nest מלאה לבדיקות e2e, עם החלפות
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";

export async function createTestApp(
  rootModule: any,
  overrides: [token: any, value: any][] = [],
  configure?: (app: INestApplication) => void,
) {
  let builder = Test.createTestingModule({ imports: [rootModule] });
  for (const [token, value] of overrides) builder = builder.overrideProvider(token).useValue(value);
  const moduleRef = await builder.compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configure?.(app);
  await app.init();
  return {
    app,
    http: () => request(app.getHttpServer()),
    close: () => app.close(),
  };
}
