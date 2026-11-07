import { test } from "node:test";
import assert from "node:assert/strict";
import { load, listen, api } from "../../tools/load.mjs";

const { createApp } = await load(import.meta.url, "tasks-api/src/app.ts");

async function seeded(t) {
  const clock = { now: new Date("2026-11-01T09:00:00.000Z") };
  const { base, close } = await listen(createApp({ now: () => clock.now }));
  t.after(close);
  const call = api(base);
  const tasks = [
    { title: "לקנות חלב", priority: "low", dueDate: "2026-11-02" },
    { title: "Express — פרק 15", priority: "high", dueDate: "2026-11-20", description: "routes ו־middleware" },
    { title: "להתקשר לבנק", priority: "medium" },
    { title: "לסדר את המחסן", priority: "high", dueDate: "2026-11-03", status: "done" },
    { title: "לחזור על express.Router", priority: "medium", dueDate: "2026-11-10", status: "in_progress" },
  ];
  for (const [i, body] of tasks.entries()) {
    clock.now = new Date(Date.UTC(2026, 10, 1, 9, i));
    const res = await call("POST", "/tasks", body);
    assert.equal(res.status, 201, `יצירת משימה ${i + 1}`);
  }
  clock.now = new Date("2026-11-05T12:00:00.000Z");
  return call;
}
const ids = (res) => res.body.data.map((t) => t.id);

test("ברירת מחדל: החדשות קודם, meta", async (t) => {
  const call = await seeded(t);
  const res = await call("GET", "/tasks");
  assert.deepEqual(ids(res), [5, 4, 3, 2, 1]);
  assert.deepEqual(res.body.meta, { page: 1, limit: 20, total: 5, totalPages: 1 });
});
test("סינון וחיפוש", async (t) => {
  const call = await seeded(t);
  assert.deepEqual(ids(await call("GET", "/tasks?status=todo")), [3, 2, 1]);
  assert.deepEqual(ids(await call("GET", "/tasks?priority=high")), [4, 2]);
  assert.deepEqual(ids(await call("GET", "/tasks?q=EXPRESS")), [5, 2]);
  assert.deepEqual(ids(await call("GET", "/tasks?q=" + encodeURIComponent("middleware"))), [2], "חיפוש גם בתיאור");
  assert.deepEqual(ids(await call("GET", "/tasks?status=todo&priority=high")), [2]);
});
test("מיון", async (t) => {
  const call = await seeded(t);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=createdAt")), [1, 2, 3, 4, 5]);
  assert.deepEqual(ids(await call("GET", "/tasks?sort=dueDate")), [1, 4, 5, 2, 3], "בלי dueDate — בסוף");
  assert.deepEqual(ids(await call("GET", "/tasks?sort=-dueDate")), [2, 5, 4, 1, 3], "בלי dueDate — בסוף גם ביורד");
  assert.deepEqual(ids(await call("GET", "/tasks?sort=-priority")), [2, 4, 3, 5, 1], "שוויון — לפי id");
  assert.deepEqual(ids(await call("GET", "/tasks?sort=priority")), [1, 3, 5, 2, 4]);
});
test("pagination", async (t) => {
  const call = await seeded(t);
  let res = await call("GET", "/tasks?sort=createdAt&limit=2&page=3");
  assert.deepEqual(ids(res), [5]);
  assert.deepEqual(res.body.meta, { page: 3, limit: 2, total: 5, totalPages: 3 });
  res = await call("GET", "/tasks?page=4&limit=2");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.data, []);
  res = await call("GET", "/tasks?status=todo&limit=2");
  assert.deepEqual(res.body.meta, { page: 1, limit: 2, total: 3, totalPages: 2 }, "total — אחרי סינון");
  for (const q of ["limit=51", "page=0", "sort=title", "status=open"]) {
    res = await call("GET", "/tasks?" + q);
    assert.equal(res.status, 400, q);
    assert.equal(res.body.error.code, "VALIDATION_ERROR");
  }
});
test("stats", async (t) => {
  const call = await seeded(t);
  const res = await call("GET", "/tasks/stats");
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { total: 5, byStatus: { todo: 3, in_progress: 1, done: 1 }, overdue: 1 });
});
