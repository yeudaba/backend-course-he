import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "P15-E17.ts");
async function start(t, app) {
  const { base, close } = await listen(app);
  t.after(close);
  return api(base);
}

test("עדכונים תקינים", async (t) => {
  const call = await start(t, createApp());
  let res = await call("PATCH", "/tasks/1", { done: true });
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { id: 1, title: "לקנות חלב", done: true, priority: "medium" });
  res = await call("PATCH", "/tasks/2", { title: "  חדש ", priority: "low" });
  assert.deepEqual(res.body, { id: 2, title: "חדש", done: false, priority: "low" });
});
test("שגיאות", async (t) => {
  const call = await start(t, createApp());
  for (const body of [{}, { id: 99 }, { owner: "x" }, { title: "" }, { done: "yes" }, { priority: "urgent" }, { done: true, titel: "x" }]) {
    const res = await call("PATCH", "/tasks/1", body);
    assert.equal(res.status, 400, JSON.stringify(body));
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  }
  assert.equal((await call("PATCH", "/tasks/abc", { done: true })).status, 400);
  assert.equal((await call("PATCH", "/tasks/0", { done: true })).status, 400);
  assert.equal((await call("PATCH", "/tasks/9", { done: true })).status, 404);
  assert.equal((await call("PATCH", "/tasks/1", { id: 99 })).status, 400);
});
