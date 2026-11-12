// P22-E96 — בדיקות ל־taskStats
import { test } from "node:test";
import assert from "node:assert/strict";
import { taskStats } from "./P22-E96.ts";

const t = (status: "todo" | "in_progress" | "done", dueDate: string | null = null) => ({ status, dueDate });

test("רשימה ריקה — כל המפתחות, אפסים", () => {
  assert.deepEqual(taskStats([], "2026-11-05"), { total: 0, byStatus: { todo: 0, in_progress: 0, done: 0 }, overdue: 0 });
});

test("ספירה לפי סטטוס", () => {
  const r = taskStats([t("todo"), t("todo"), t("done"), t("in_progress"), t("todo")], "2026-11-05");
  assert.deepEqual(r, { total: 5, byStatus: { todo: 3, in_progress: 1, done: 1 }, overdue: 0 });
});

test("באיחור — לפני היום, לא done, עם תאריך", () => {
  const tasks = [t("todo", "2026-11-04"), t("todo", "2026-11-05"), t("done", "2026-11-04"), t("todo"), t("in_progress", "2026-10-01"), t("todo", "2026-11-06")];
  assert.equal(taskStats(tasks, "2026-11-05").overdue, 2);
});

test("הקלט לא משתנה", () => {
  const tasks = [t("todo", "2026-11-09"), t("done", null), t("todo", "2026-11-01")];
  const copy = structuredClone(tasks);
  taskStats(tasks, "2026-11-05");
  assert.deepEqual(tasks, copy);
});
