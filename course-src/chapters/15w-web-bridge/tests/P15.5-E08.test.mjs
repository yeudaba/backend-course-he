import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { load, listen } from "../../tools/load.mjs";

const { createApiClient, ApiError } = await load(import.meta.url, "P15.5-E08.mjs");

function fakeApi(seen) {
  const app = express();
  app.use(express.json());
  app.use((req, res, next) => { seen.push({ method: req.method, url: req.originalUrl, type: req.get("content-type") ?? null, body: req.body }); next(); });
  app.get("/tasks", (req, res) => res.json({ data: [{ id: 1 }], meta: { page: 1 } }));
  app.post("/tasks", (req, res) => {
    if (!req.body?.title) return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "קלט לא תקין", details: [{ path: "body.title", message: "חובה" }] } });
    res.status(201).json({ id: 2, ...req.body });
  });
  app.patch("/tasks/:id", (req, res) => (req.params.id === "9" ? res.status(404).json({ error: { code: "TASK_NOT_FOUND", message: "לא נמצאה" } }) : res.json({ id: Number(req.params.id), ...req.body })));
  app.delete("/tasks/:id", (req, res) => res.sendStatus(204));
  app.get("/broken", (req, res) => res.status(502).send("<html>Bad Gateway</html>"));
  return app;
}

test("לקוח API", async (t) => {
  const seen = [];
  const { base, close } = await listen(fakeApi(seen));
  t.after(close);
  const api = createApiClient(base);

  assert.deepEqual(await api.listTasks({ status: "todo", q: "", page: 2, priority: undefined, sort: null }), { data: [{ id: 1 }], meta: { page: 1 } });
  assert.equal(seen.at(-1).url, "/tasks?status=todo&page=2");
  assert.equal(seen.at(-1).type, null, "GET בלי Content-Type");
  await api.listTasks();
  assert.equal(seen.at(-1).url, "/tasks");

  assert.deepEqual(await api.createTask({ title: "א" }), { id: 2, title: "א" });
  assert.match(seen.at(-1).type, /application\/json/);
  assert.deepEqual(await api.updateTask(3, { status: "done" }), { id: 3, status: "done" });
  assert.equal(seen.at(-1).method, "PATCH");
  assert.equal(await api.deleteTask(3), undefined);
  assert.equal(seen.at(-1).method, "DELETE");

  await assert.rejects(api.createTask({}), (e) => e instanceof ApiError && e.status === 400 && e.code === "VALIDATION_ERROR" && e.message === "קלט לא תקין" && e.details[0].path === "body.title");
  await assert.rejects(api.updateTask(9, { status: "done" }), (e) => e instanceof ApiError && e.status === 404 && e.code === "TASK_NOT_FOUND" && Array.isArray(e.details) && e.details.length === 0);
});
test("שגיאה שאינה JSON", async (t) => {
  const { base, close } = await listen(fakeApi([]));
  t.after(close);
  const api = createApiClient(base + "/broken#");
  await assert.rejects(api.listTasks(), (e) => e instanceof ApiError && e.status === 502 && e.code === "UNKNOWN" && e.message === "HTTP 502");
});
