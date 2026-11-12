import { test } from "node:test";
import assert from "node:assert/strict";
import { api } from "../../tools/load.mjs";
import { exportsOf } from "./_nest.mjs";

const T = (id, dueDate, done = false) => ({ id, title: `t${id}`, dueDate, done });
async function start(t, createTestApp, opts) {
  const app = await createTestApp(opts);
  const server = app.getHttpServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  t.after(async () => {
    server.closeAllConnections?.();
    await app.close();
  });
  return api(`http://127.0.0.1:${server.address().port}`);
}
test("createTestApp עם שעון ומשימות", async (t) => {
  const { createTestApp } = exportsOf(import.meta.url, "P20-E78.ts", ["createTestApp", "TasksModule", "TasksService", "CLOCK", "TASKS"]);
  const tasks = [T(1, "2026-11-03"), T(2, "2026-11-04"), T(3, "2026-10-01", true), T(4, null), T(5, "2026-01-15"), T(6, "2026-11-05")];
  const call = await start(t, createTestApp, { now: new Date("2026-11-04T10:00:00Z"), tasks });
  assert.deepEqual((await call("GET", "/tasks/overdue")).body.map((x) => x.id), [5, 1], "לפני היום, לא הושלמו, לפי תאריך");
  const late = await start(t, createTestApp, { now: new Date("2026-11-05T23:59:00Z"), tasks });
  assert.deepEqual((await late("GET", "/tasks/overdue")).body.map((x) => x.id), [5, 1, 2], "שעון אחר — תוצאה אחרת");
  const empty = await start(t, createTestApp, { now: new Date("2030-01-01T00:00:00Z"), tasks: [] });
  assert.deepEqual((await empty("GET", "/tasks/overdue")).body, []);
});
