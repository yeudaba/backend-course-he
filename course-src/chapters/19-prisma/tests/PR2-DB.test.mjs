import { test } from "node:test";
import assert from "node:assert/strict";
import { load, target, listen, api } from "../../tools/load.mjs";
import { sandbox } from "../../tools/sql.mjs";

// פרויקט 2, שלב ב׳: אותו API — הפעם מול PostgreSQL דרך PrismaTasksRepository
const { createApp } = await load(import.meta.url, "tasks-api/src/app.ts");
const { PrismaTasksRepository } = await load(import.meta.url, "tasks-api/src/tasks/tasks.prisma-repository.ts");

async function setup(t, clock) {
  const db = await sandbox(t, import.meta.url);
  await db.applyMigrations(target(import.meta.url, "tasks-api/prisma/migrations"));
  const prisma = await db.prisma({ clientPath: target(import.meta.url, "tasks-api/src/generated/prisma/client.ts") });
  const { base, close } = await listen(createApp({ repository: new PrismaTasksRepository(prisma), now: () => clock.now }));
  t.after(close);
  return { db, call: api(base) };
}

async function seeded(t) {
  const clock = { now: new Date("2026-11-01T09:00:00.000Z") };
  const ctx = await setup(t, clock);
  const tasks = [
    { title: "לקנות חלב", priority: "low", dueDate: "2026-11-02" },
    { title: "Express — פרק 15", priority: "high", dueDate: "2026-11-20", description: "routes ו־middleware" },
    { title: "להתקשר לבנק", priority: "medium" },
    { title: "לסדר את המחסן", priority: "high", dueDate: "2026-11-03", status: "done" },
    { title: "לחזור על express.Router", priority: "medium", dueDate: "2026-11-10", status: "in_progress" },
  ];
  for (const [i, body] of tasks.entries()) {
    clock.now = new Date(Date.UTC(2026, 10, 1, 9, i));
    assert.equal((await ctx.call("POST", "/tasks", body)).status, 201, `יצירת משימה ${i + 1}`);
  }
  clock.now = new Date("2026-11-05T12:00:00.000Z");
  return ctx;
}
const ids = (res) => res.body.data.map((t) => t.id);

test("CRUD — והנתונים באמת במסד", async (t) => {
  const clock = { now: new Date("2026-11-04T10:00:00.000Z") };
  const { db, call } = await setup(t, clock);
  let res = await call("POST", "/tasks", { title: "ללמוד Prisma", priority: "high", dueDate: "2026-12-31" });
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, { id: 1, title: "ללמוד Prisma", description: null, status: "todo", priority: "high", dueDate: "2026-12-31", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z" });
  const [row] = await db.rows("SELECT title, due_date::text AS due, created_at = '2026-11-04T10:00:00Z'::timestamptz AS created_ok FROM tasks");
  assert.deepEqual(row, { title: "ללמוד Prisma", due: "2026-12-31", created_ok: true }, "בטבלה tasks, עם התאריכים הנכונים (UTC)");
  clock.now = new Date("2026-11-05T08:00:00.000Z");
  res = await call("PATCH", "/tasks/1", { status: "done", dueDate: null });
  assert.equal(res.body.status, "done");
  assert.equal(res.body.dueDate, null);
  assert.equal(res.body.updatedAt, "2026-11-05T08:00:00.000Z");
  assert.equal((await call("GET", "/tasks/1")).body.title, "ללמוד Prisma");
  assert.equal((await call("PATCH", "/tasks/9", { status: "done" })).status, 404);
  assert.equal((await call("DELETE", "/tasks/1")).status, 204);
  assert.equal((await call("DELETE", "/tasks/1")).status, 404);
  assert.equal((await db.rows("SELECT COUNT(*) AS n FROM tasks"))[0].n, 0);
});

test("רשימה: סינון, חיפוש, מיון ו־pagination — במסד", async (t) => {
  const { call } = await seeded(t);
  let res = await call("GET", "/tasks");
  assert.deepEqual(ids(res), [5, 4, 3, 2, 1]);
  assert.deepEqual(res.body.meta, { page: 1, limit: 20, total: 5, totalPages: 1 });
  assert.deepEqual(ids(await call("GET", "/tasks?status=todo")), [3, 2, 1]);
  assert.deepEqual(ids(await call("GET", "/tasks?q=EXPRESS")), [5, 2]);
  assert.deepEqual(ids(await call("GET", "/tasks?q=" + encodeURIComponent("middleware"))), [2]);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=dueDate")), [1, 4, 5, 2, 3]);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=-dueDate")), [2, 5, 4, 1, 3]);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=-priority")), [2, 4, 3, 5, 1]);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=priority")), [1, 3, 5, 2, 4]);
  res = await call("GET", "/tasks?sort=createdAt&limit=2&page=3");
  assert.deepEqual(ids(res), [5]);
  assert.deepEqual(res.body.meta, { page: 3, limit: 2, total: 5, totalPages: 3 });
  res = await call("GET", "/tasks?status=todo&limit=2");
  assert.deepEqual(res.body.meta, { page: 1, limit: 2, total: 3, totalPages: 2 });
});

test("stats — במסד", async (t) => {
  const { call } = await seeded(t);
  assert.deepEqual((await call("GET", "/tasks/stats")).body, { total: 5, byStatus: { todo: 3, in_progress: 1, done: 1 }, overdue: 1 });
});
