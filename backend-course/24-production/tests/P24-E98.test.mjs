import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P24-E98.ts", ["createTodayFor", "countOverdue"]);
const users = {
  async findById(id) {
    return { 1: { id: 1, timeZone: "Asia/Jerusalem" }, 2: { id: 2, timeZone: "America/New_York" }, 3: { id: 3, timeZone: "Pacific/Kiritimati" } }[id] ?? null;
  },
};

test("createTodayFor — לפי האזור של המשתמש", async () => {
  const { createTodayFor } = await get();
  let at = new Date("2026-11-04T22:30:00Z");
  const todayFor = createTodayFor(users, () => at);
  assert.equal(await todayFor(1), "2026-11-05");
  assert.equal(await todayFor(2), "2026-11-04");
  assert.equal(await todayFor(3), "2026-11-05");
  assert.equal(await todayFor(99), "2026-11-04", "לא נמצא ← UTC");
  at = new Date("2026-11-05T10:00:00Z");
  assert.equal(await todayFor(2), "2026-11-05", "now נקרא בכל פעם");
});
test("countOverdue", async () => {
  const { countOverdue } = await get();
  const tasks = [
    { status: "todo", dueDate: "2026-11-04" },
    { status: "in_progress", dueDate: "2026-11-01" },
    { status: "done", dueDate: "2026-11-01" },
    { status: "todo", dueDate: "2026-11-05" },
    { status: "todo", dueDate: null },
    { status: "todo", dueDate: "2025-12-31" },
  ];
  assert.equal(countOverdue(tasks, "2026-11-05"), 3);
  assert.equal(countOverdue(tasks, "2026-11-04"), 2, "יום היעד עצמו — עוד לא באיחור");
  assert.equal(countOverdue([], "2026-11-05"), 0);
});
