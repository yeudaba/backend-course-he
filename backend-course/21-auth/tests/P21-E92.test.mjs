import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { loadNest } from "../../tools/nest.mjs";

const require = createRequire(import.meta.url);
const m = loadNest(import.meta.url, "P21-E92.ts");

test("המסמך", async (t) => {
  for (const n of ["TasksController", "HealthController", "AppModule", "createDocument"]) assert.ok(m[n], `הקובץ לא מייצא את ${n}`);
  const { NestFactory } = require("@nestjs/core");
  const app = await NestFactory.create(m.AppModule, { logger: false });
  t.after(() => app.close());
  const doc = m.createDocument(app);
  assert.equal(doc.info?.title, "tasks-api");
  assert.equal(doc.info?.version, "1.0");
  assert.deepEqual(doc.components?.securitySchemes?.bearer, { scheme: "bearer", bearerFormat: "JWT", type: "http" }, "addBearerAuth() — סכמה בשם bearer");
  assert.ok(doc.paths["/tasks"]?.get, "GET /tasks במסמך");
  assert.ok(doc.paths["/health"]?.get, "GET /health במסמך");
  assert.deepEqual(doc.paths["/tasks"].get.security, [{ bearer: [] }], "/tasks מסומן כדורש Bearer (@ApiBearerAuth על ה־controller)");
  assert.equal(doc.paths["/health"].get.security, undefined, "/health — בלי Bearer");
});
test("ה־routes עצמם", async (t) => {
  const { nestApp } = await import("../../tools/nest.mjs");
  const { call } = await nestApp(t, m.AppModule);
  assert.deepEqual((await call("GET", "/tasks")).body, []);
  assert.deepEqual((await call("GET", "/health")).body, { ok: true });
});
