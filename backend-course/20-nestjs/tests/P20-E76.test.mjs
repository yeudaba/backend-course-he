import { test } from "node:test";
import assert from "node:assert/strict";
import { nestApp } from "../../tools/nest.mjs";
import { exportsOf } from "./_nest.mjs";

test("המרות של Zod ונתיבים בשגיאות", async (t) => {
  const { TasksModule, ZodValidationPipe } = exportsOf(import.meta.url, "P20-E76.ts", ["TasksModule", "ZodValidationPipe", "TasksController"]);
  const { call } = await nestApp(t, TasksModule);
  const ok = await call("POST", "/tasks", { title: "  Buy milk " });
  assert.equal(ok.status, 201);
  assert.deepEqual(ok.body, { title: "Buy milk", priority: "medium" }, "trim ו־default של Zod");
  assert.deepEqual((await call("GET", "/tasks/7")).body, { id: 7 });
  assert.deepEqual((await call("GET", "/tasks")).body, { page: 1 });
  assert.deepEqual((await call("GET", "/tasks?page=3")).body, { page: 3 });
  const bad = await call("POST", "/tasks", { title: "", priority: "urgent" });
  assert.equal(bad.status, 400);
  assert.equal(bad.body?.error?.code, "VALIDATION_ERROR");
  assert.equal(bad.body.error.message, "קלט לא תקין");
  assert.deepEqual(bad.body.error.details.map((d) => d.path).sort(), ["body.priority", "body.title"]);
  assert.ok(bad.body.error.details.every((d) => typeof d.message === "string" && d.message.length > 0));
  const id = await call("GET", "/tasks/abc");
  assert.equal(id.status, 400);
  assert.deepEqual(id.body.error.details.map((d) => d.path), ["params.id"]);
  const page = await call("GET", "/tasks?page=0");
  assert.deepEqual(page.body.error.details.map((d) => d.path), ["query.page"]);
  const p = new ZodValidationPipe({ safeParse: (v) => ({ success: false, error: { issues: [{ path: ["items", 2, "qty"], message: "too big" }] } }) });
  try {
    p.transform({}, { type: "body", data: undefined });
    assert.fail("צריך לזרוק");
  } catch (e) {
    assert.deepEqual(e.getResponse().error.details, [{ path: "body.items.2.qty", message: "too big" }], "נתיב מקונן של Zod");
  }
});
