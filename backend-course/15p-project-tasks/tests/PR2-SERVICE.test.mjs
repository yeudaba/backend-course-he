import { test } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { TasksService } = await load(import.meta.url, "tasks-api/src/tasks/tasks.service.ts");
const { InMemoryTasksRepository } = await load(import.meta.url, "tasks-api/src/tasks/tasks.repository.ts");
const { HttpError } = await load(import.meta.url, "tasks-api/src/errors.ts");

const input = (o = {}) => ({ title: "משימה", description: null, status: "todo", priority: "medium", dueDate: null, ...o });
function setup(start = "2026-11-04T10:00:00.000Z") {
  const clock = { now: new Date(start) };
  return { clock, service: new TasksService(new InMemoryTasksRepository(), () => clock.now) };
}
const isHttp = (status, code) => (e) => e instanceof HttpError && e.status === status && e.code === code;

test("repository מחזיר עותקים", async () => {
  const repo = new InMemoryTasksRepository();
  const t = await repo.insert({ ...input(), createdAt: "x", updatedAt: "x" });
  assert.equal(t.id, 1);
  t.title = "שונה מבחוץ";
  (await repo.findAll())[0].title = "גם זה";
  assert.equal((await repo.findById(1)).title, "משימה");
  assert.equal(await repo.findById(9), undefined);
  assert.equal(await repo.update(9, { title: "x" }), undefined);
  assert.equal(await repo.delete(1), true);
  assert.equal(await repo.delete(1), false);
  assert.equal((await repo.insert({ ...input(), createdAt: "x", updatedAt: "x" })).id, 2, "ids לא חוזרים אחרי מחיקה");
});
test("create ו־get", async () => {
  const { service } = setup();
  const t = await service.create(input({ title: "א", dueDate: "2026-11-04" }));
  assert.deepEqual(t, { id: 1, title: "א", description: null, status: "todo", priority: "medium", dueDate: "2026-11-04", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z" });
  assert.deepEqual(await service.get(1), t);
  await assert.rejects(service.get(2), isHttp(404, "TASK_NOT_FOUND"));
});
test("dueDate בעבר → 422", async () => {
  const { service } = setup();
  await assert.rejects(service.create(input({ dueDate: "2026-11-03" })), isHttp(422, "DUE_DATE_IN_PAST"));
});
test("update מעדכן updatedAt", async () => {
  const { service, clock } = setup();
  await service.create(input());
  clock.now = new Date("2026-11-05T08:00:00.000Z");
  const t = await service.update(1, { status: "done" });
  assert.equal(t.status, "done");
  assert.equal(t.createdAt, "2026-11-04T10:00:00.000Z");
  assert.equal(t.updatedAt, "2026-11-05T08:00:00.000Z");
  await assert.rejects(service.update(5, { status: "done" }), isHttp(404, "TASK_NOT_FOUND"));
});
test("remove", async () => {
  const { service } = setup();
  await service.create(input());
  await service.remove(1);
  await assert.rejects(service.get(1), isHttp(404, "TASK_NOT_FOUND"));
  await assert.rejects(service.remove(1), isHttp(404, "TASK_NOT_FOUND"));
});
