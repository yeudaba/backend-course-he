import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("stats ו־:id", async (t) => {
  const { TasksModule } = exportsOf(import.meta.url, "P20-E77.ts", ["TasksModule", "TasksController"]);
  const { call } = await nestApp(t, TasksModule);
  const s = await call("GET", "/tasks/stats");
  assert.equal(s.status, 200, "/tasks/stats לא צריך להגיע ל־ParseIntPipe של :id");
  assert.deepEqual(s.body, { total: 4, done: 2 });
  assert.deepEqual((await call("GET", "/tasks/3")).body, { id: 3, done: true });
  assert.equal((await call("GET", "/tasks/9")).status, 404);
  assert.equal((await call("GET", "/tasks/x")).status, 400);
});
