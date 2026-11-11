import { test } from "node:test";
import assert from "node:assert/strict";
import express from "express";
import { listen, api } from "../../tools/load.mjs";
import { exportsOf } from "./_ts.mjs";
import { typesOk } from "./_app.mjs";

const FILE = "P15-E63.ts";
const NF = { error: { code: "TASK_NOT_FOUND", message: "המשימה לא נמצאה" } };
async function start(t, prefix = "/tasks") {
  const { createTasksRouter } = await exportsOf(import.meta.url, FILE, ["createTasksRouter"]);
  const calls = [];
  const comments = new Map([[7, [{ id: 1, text: "ראשונה" }]], [12, []]]);
  let next = 100;
  const service = {
    getTask(id) { calls.push(["getTask", id]); return comments.has(id) ? { id, title: `משימה ${id}` } : undefined; },
    listComments(taskId) { calls.push(["listComments", taskId]); return comments.get(taskId); },
    addComment(taskId, text) { calls.push(["addComment", taskId, text]); const c = { id: next++, text }; comments.get(taskId).push(c); return c; },
  };
  const app = express();
  app.use(prefix, createTasksRouter(service));
  const { base, close } = await listen(app);
  t.after(close);
  return { call: api(base), calls };
}
test("עובר בדיקת טיפוסים", () => typesOk(import.meta.url, FILE));
test("משימה ותגובות", async (t) => {
  const { call } = await start(t);
  assert.deepEqual((await call("GET", "/tasks/7")).body, { id: 7, title: "משימה 7" });
  assert.deepEqual((await call("GET", "/tasks/7/comments")).body, { data: [{ id: 1, text: "ראשונה" }] });
  assert.deepEqual((await call("GET", "/tasks/12/comments")).body, { data: [] });
  const r = await call("POST", "/tasks/12/comments", { text: "  שלום  " });
  assert.equal(r.status, 201);
  assert.equal(r.headers.get("location"), "/tasks/12/comments/100");
  assert.deepEqual(r.body, { id: 100, text: "שלום" });
  assert.deepEqual((await call("GET", "/tasks/12/comments")).body, { data: [{ id: 100, text: "שלום" }] });
});
test("Location לפי הקידומת", async (t) => {
  const { call } = await start(t, "/api/v2/tasks");
  const r = await call("POST", "/api/v2/tasks/7/comments", { text: "x" });
  assert.equal(r.headers.get("location"), "/api/v2/tasks/7/comments/100", "השתמש ב־req.baseUrl");
});
test("404 — ובלי לפנות ל־service כשה־id לא תקין", async (t) => {
  const { call, calls } = await start(t);
  for (const [m, p, body] of [["GET", "/tasks/9"], ["GET", "/tasks/9/comments"], ["POST", "/tasks/9/comments", { text: "x" }]]) {
    const r = await call(m, p, body);
    assert.deepEqual([r.status, r.body], [404, NF], `${m} ${p}`);
  }
  assert.ok(!calls.some((c) => c[0] === "listComments" || c[0] === "addComment"), "משימה לא קיימת — לא קוראים ל־listComments/addComment");
  calls.length = 0;
  for (const p of ["/tasks/abc", "/tasks/0", "/tasks/-1", "/tasks/1.5", "/tasks/7abc/comments"]) {
    const r = await call("GET", p);
    assert.deepEqual([r.status, r.body], [404, NF], p);
  }
  assert.deepEqual(calls, [], "id לא תקין — לא פונים ל־service בכלל");
});
test("text לא תקין", async (t) => {
  const { call, calls } = await start(t);
  for (const body of [{}, { text: "  " }, { text: 3 }, { text: "x".repeat(501) }, undefined]) {
    const r = await call("POST", "/tasks/7/comments", body);
    assert.deepEqual([r.status, r.body], [400, { error: { code: "VALIDATION_ERROR", message: "text לא תקין" } }], JSON.stringify(body));
  }
  assert.ok(!calls.some((c) => c[0] === "addComment"));
  assert.equal((await call("POST", "/tasks/7/comments", { text: "x".repeat(500) })).status, 201);
});
