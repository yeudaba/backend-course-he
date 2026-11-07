import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "tasks-api/src/app.ts");
async function start(t, options) {
  const { base, close } = await listen(createApp({ now: () => new Date("2026-11-04T10:00:00.000Z"), ...options }));
  t.after(close);
  return api(base);
}

test("health", async (t) => {
  const call = await start(t);
  assert.deepEqual((await call("GET", "/health")).body, { ok: true });
});
test("CRUD", async (t) => {
  const call = await start(t);
  let res = await call("POST", "/tasks", { title: "ללמוד Express", priority: "high", dueDate: "2026-12-31" });
  assert.equal(res.status, 201);
  assert.equal(res.headers.get("location"), "/tasks/1");
  assert.deepEqual(res.body, { id: 1, title: "ללמוד Express", description: null, status: "todo", priority: "high", dueDate: "2026-12-31", createdAt: "2026-11-04T10:00:00.000Z", updatedAt: "2026-11-04T10:00:00.000Z" });
  assert.deepEqual((await call("GET", "/tasks/1")).body.title, "ללמוד Express");
  res = await call("PATCH", "/tasks/1", { status: "in_progress", description: "פרק 15" });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, "in_progress");
  assert.equal(res.body.description, "פרק 15");
  res = await call("DELETE", "/tasks/1");
  assert.equal(res.status, 204);
  assert.equal(res.body, undefined);
  res = await call("GET", "/tasks/1");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "TASK_NOT_FOUND");
  assert.equal(typeof res.body.error.message, "string");
});
test("ולידציה", async (t) => {
  const call = await start(t);
  let res = await call("POST", "/tasks", { title: "", priority: "urgent" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "VALIDATION_ERROR");
  assert.deepEqual(res.body.error.details.map((d) => d.path).sort(), ["body.priority", "body.title"]);
  res = await call("GET", "/tasks/abc");
  assert.equal(res.status, 400);
  assert.equal(res.body.error.details[0].path, "params.id");
  await call("POST", "/tasks", { title: "א" });
  assert.equal((await call("PATCH", "/tasks/1", { id: 9 })).status, 400);
  assert.equal((await call("PATCH", "/tasks/1", {})).status, 400);
  assert.equal((await call("PATCH", "/tasks/0", { status: "done" })).status, 400);
  assert.equal((await call("PATCH", "/tasks/7", { status: "done" })).status, 404);
  assert.equal((await call("DELETE", "/tasks/7")).status, 404);
});
test("כללים ושגיאות כלליות", async (t) => {
  const call = await start(t);
  let res = await call("POST", "/tasks", { title: "א", dueDate: "2026-01-01" });
  assert.equal(res.status, 422);
  assert.equal(res.body.error.code, "DUE_DATE_IN_PAST");
  res = await call("POST", "/tasks", undefined, { raw: "{oops" });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, "INVALID_JSON");
  res = await call("GET", "/projects");
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, "NOT_FOUND");
  res = await call("PUT", "/tasks/1", { title: "x" });
  assert.equal(res.status, 404);
});
test("repository מוזרק ולוג", async (t) => {
  const lines = [];
  const call = await start(t, { log: (l) => lines.push(l) });
  await call("GET", "/health");
  await new Promise((r) => setTimeout(r, 20));
  assert.match(lines[0] ?? "", /^GET \/health 200 \d+ms$/);
});
