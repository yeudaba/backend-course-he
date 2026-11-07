import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { target, api } from "../../tools/load.mjs";

// פרויקט 2, שלב ג׳: אותו API — ב־NestJS. נבדק הקוד המקומפל (npm run build ← dist/), עם repository בזיכרון ושעון קבוע
const pkg = target(import.meta.url, "tasks-api/package.json");
const dist = (f) => target(import.meta.url, `tasks-api/dist/${f}`);
if (!fs.existsSync(dist("app.module.js"))) {
  throw new Error("לא נמצא dist/app.module.js — הרץ npm run build בתיקיית הפרויקט (וגם npx prisma generate)");
}
const projectRequire = createRequire(pkg); // אותו עותק של Nest כמו בפרויקט
projectRequire("reflect-metadata");
const { Test } = projectRequire("@nestjs/testing");
const { AppModule } = projectRequire(dist("app.module.js"));
const { configureApp } = projectRequire(dist("app.setup.js"));
const { TASKS_REPOSITORY, CLOCK } = projectRequire(dist("tasks/tasks.tokens.js"));
const { InMemoryTasksRepository } = projectRequire(dist("tasks/tasks.repository.js"));
const { PrismaService } = projectRequire(dist("prisma/prisma.service.js"));

async function start(t, clock) {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(TASKS_REPOSITORY).useValue(new InMemoryTasksRepository())
    .overrideProvider(CLOCK).useValue({ now: () => clock.now })
    .overrideProvider(PrismaService).useValue({ $disconnect: async () => {} })
    .compile();
  const app = moduleRef.createNestApplication({ logger: false });
  configureApp(app);
  await app.init();
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => { server.closeAllConnections?.(); await app.close(); });
  return api(`http://127.0.0.1:${server.address().port}`);
}

test("health, CRUD ושגיאות — באותו מבנה כמו בגרסת Express", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const call = await start(t, clock);
  assert.deepEqual((await call("GET", "/health")).body, { ok: true });
  let res = await call("POST", "/tasks", { title: "ללמוד Nest", priority: "high", dueDate: "2026-12-31" });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/tasks/1");
  assert.deepEqual(res.body, { id: 1, title: "ללמוד Nest", description: null, status: "todo", priority: "high", dueDate: "2026-12-31", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z" });
  res = await call("PATCH", "/tasks/1", { status: "done" });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "done");
  res = await call("POST", "/tasks", { title: "", priority: "urgent" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.deepEqual(res.body.error.details.map((d) => d.path).sort(), ["body.priority", "body.title"]);
  res = await call("GET", "/tasks/abc");
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details[0].path, "params.id");
  res = await call("GET", "/tasks/99");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "TASK_NOT_FOUND");
  res = await call("POST", "/tasks", { title: "x", dueDate: "2020-01-01" });
  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, "DUE_DATE_IN_PAST");
  res = await call("POST", "/tasks", undefined, { raw: "{oops" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "INVALID_JSON");
  res = await call("GET", "/projects");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "NOT_FOUND");
  assert.equal((await call("DELETE", "/tasks/1")).status, 204);
  assert.equal((await call("DELETE", "/tasks/1")).status, 404);
});

test("רשימה ו־stats", async (t) => {
  const clock = { now: new Date("2026-11-01T09:00:00.000Z") };
  const call = await start(t, clock);
  for (const [i, body] of [
    { title: "לקנות חלב", priority: "low", dueDate: "2026-11-02" },
    { title: "Express — פרק 15", priority: "high", dueDate: "2026-11-20" },
    { title: "להתקשר לבנק", priority: "medium" },
    { title: "לסדר את המחסן", priority: "high", dueDate: "2026-11-03", status: "done" },
  ].entries()) {
    clock.now = new Date(Date.UTC(2026, 10, 1, 9, i));
    assert.equal((await call("POST", "/tasks", body)).status, 201);
  }
  clock.now = new Date("2026-11-05T12:00:00.000Z");
  assert.deepEqual((await call("GET", "/tasks?sort=-priority")).body.data.map((x) => x.id), [2, 4, 3, 1]);
  const page = await call("GET", "/tasks?status=todo&limit=2");
  assert.deepEqual(page.body.meta, { page: 1, limit: 2, total: 3, totalPages: 2 });
  assert.equal((await call("GET", "/tasks?limit=51")).status, 400);
  assert.deepEqual((await call("GET", "/tasks/stats")).body, { total: 4, byStatus: { todo: 3, in_progress: 0, done: 1 }, overdue: 1 });
});

test("Swagger ב־/docs", async (t) => {
  const call = await start(t, { now: new Date() });
  const res = await call("GET", "/docs-json");
  assert.equal(res.status, 200, "התיעוד צריך להיות ב־/docs (וה־JSON ב־/docs-json)");
  assert.ok(res.body.paths["/tasks"]?.post, "POST /tasks מתועד");
  assert.ok(res.body.paths["/tasks/{id}"]?.patch, "PATCH /tasks/{id} מתועד");
  const schema = res.body.paths["/tasks"].post.requestBody?.content?.["application/json"]?.schema;
  assert.ok(schema?.properties?.title, "גוף ה־POST מתואר (עם title)");
});
