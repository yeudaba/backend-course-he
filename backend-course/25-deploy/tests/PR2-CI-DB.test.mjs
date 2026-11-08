import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

// פרויקט 2, שלב ח׳ — מול PostgreSQL אמיתי: /ready בודק את המסד באמת (SELECT 1), ו־/version
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
if (!fs.existsSync(dist("health.controller.js")) || !fs.existsSync(dist("generated/prisma/client.js"))) {
  throw new Error("לא נמצא dist/health.controller.js — הרץ npx prisma generate ואז npm run build בתיקיית הפרויקט");
}
const req = createRequire(target(import.meta.url, "tasks-api/package.json"));
req("reflect-metadata");
const { Test } = req("@nestjs/testing");
const { AppModule } = req(dist("app.module.js"));
const { configureApp } = req(dist("app.setup.js"));
const { CONFIG } = req(dist("config.js"));
const { PrismaService } = req(dist("prisma/prisma.service.js"));

test("/ready מול מסד אמיתי", async (t) => {
  const db = await sandbox(t, import.meta.url);
  await db.applyMigrations(target(import.meta.url, "tasks-api/prisma/migrations"));
  const prisma = await db.prisma({ clientPath: dist("generated/prisma/client.js") });
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(PrismaService).useValue(prisma)
    .overrideProvider(CONFIG).useValue({ jwtSecret: "x".repeat(40), accessTokenTtlSeconds: 900, refreshTokenTtlDays: 7, bcryptRounds: 4, logLevel: "error", authRateLimitPerMinute: 10, idempotencyTtlHours: 24 })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  const call = api(`http://127.0.0.1:${server.address().port}`);

  const ready = await call("GET", "/ready");
  assert.equal(ready.status, 200, "/ready ← 200 כשהמסד זמין");
  assert.equal(ready.body.ok, true);
  assert.equal((await call("GET", "/version")).status, 200);

});
