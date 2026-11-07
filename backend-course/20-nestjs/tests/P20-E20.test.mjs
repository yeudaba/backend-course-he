import { test } from "node:test";
import assert from "node:assert/strict";
import { loadNest, nestApp } from "../../tools/nest.mjs";

const { TasksModule } = loadNest(import.meta.url, "P20-E20.ts");

test("POST /tasks — ה־service מקבל את ClockService", async (t) => {
  const { call } = await nestApp(t, TasksModule);
  const res = await call("POST", "/tasks", { title: "לכתוב בדיקות" });
  assert.equal(res.status, 201, "500 אומר שה־clock הוא undefined");
  assert.equal(res.body.title, "לכתוב בדיקות");
  assert.match(res.body.createdAt, /^\d{4}-\d\d-\d\dT/);
});
test("GET /health רשום", async (t) => {
  const { call } = await nestApp(t, TasksModule);
  const res = await call("GET", "/health");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: "ok" });
});
test("GET /tasks/:id מוצא משימה קיימת", async (t) => {
  const { call } = await nestApp(t, TasksModule);
  await call("POST", "/tasks", { title: "א" });
  const res = await call("GET", "/tasks/1");
  assert.equal(res.status, 200);
  assert.equal(res.body.title, "א");
  assert.equal((await call("GET", "/tasks/2")).status, 404);
  assert.equal((await call("GET", "/tasks/abc")).status, 400);
});
