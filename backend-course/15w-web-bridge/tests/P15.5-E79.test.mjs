import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_src.mjs";

const mod = () => exportsOf(import.meta.url, "P15.5-E79.mjs", ["summarizeTasks", "summaryText"]);
const today = "2026-11-11";
const tasks = [
  { id: 1, status: "done", dueDate: "2026-11-01" },
  { id: 2, status: "todo", dueDate: "2026-11-01" },
  { id: 3, status: "todo", dueDate: "2026-11-11" },
  { id: 4, status: "todo", dueDate: null },
  { id: 5, status: "done", dueDate: null },
  { id: 6, status: "todo", dueDate: "2026-11-10" },
  { id: 7, status: "done", dueDate: "2026-11-11" },
  { id: 8, status: "todo", dueDate: "2026-12-01" },
];
test("summarizeTasks", async () => {
  const { summarizeTasks } = await mod();
  assert.deepEqual(summarizeTasks(tasks, today), { total: 8, done: 3, overdue: 2, dueToday: 1 });
  assert.deepEqual(summarizeTasks([], today), { total: 0, done: 0, overdue: 0, dueToday: 0 });
  assert.deepEqual(summarizeTasks([{ id: 1, status: "todo", dueDate: null }], today), { total: 1, done: 0, overdue: 0, dueToday: 0 }, "null לא נחשב באיחור");
});
test("summaryText", async () => {
  const { summaryText } = await mod();
  assert.equal(summaryText({ total: 8, done: 3, overdue: 2, dueToday: 1 }), "8 משימות · 3 בוצעו · 2 באיחור · 1 להיום");
  assert.equal(summaryText({ total: 5, done: 0, overdue: 2, dueToday: 0 }), "5 משימות · 2 באיחור");
  assert.equal(summaryText({ total: 1, done: 1, overdue: 0, dueToday: 0 }), "משימה אחת · 1 בוצעו");
  assert.equal(summaryText({ total: 1, done: 0, overdue: 0, dueToday: 0 }), "משימה אחת");
  assert.equal(summaryText({ total: 0, done: 0, overdue: 0, dueToday: 0 }), "אין משימות");
});
