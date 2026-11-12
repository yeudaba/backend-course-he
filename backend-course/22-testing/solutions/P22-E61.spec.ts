// P22-E61 — בדיקות integration
import { test, before, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { createTestSchema } from "./P22-E61-db.ts";
import { TasksRepository } from "./P22-E61.ts";

let db: Awaited<ReturnType<typeof createTestSchema>>;
let repo: TasksRepository;
before(async () => {
  db = await createTestSchema();
  repo = new TasksRepository(db.pool);
});
beforeEach(() => db.reset());
after(() => db.close());

test("insert — ברירות מחדל", async () => {
  assert.deepEqual(await repo.insert(1, { title: "חלב" }), { id: 1, ownerId: 1, title: "חלב", status: "todo", dueDate: null });
  const t = await repo.insert(1, { title: "חשמל", status: "done", dueDate: "2026-11-05" });
  assert.equal(t.dueDate, "2026-11-05");
});

test("list — רק של הבעלים, לפי תאריך, בלי תאריך בסוף", async () => {
  await repo.insert(1, { title: "בלי תאריך" });
  await repo.insert(1, { title: "מאוחר", dueDate: "2026-11-20" });
  await repo.insert(2, { title: "של יוסי", dueDate: "2026-11-01" });
  await repo.insert(1, { title: "מוקדם", dueDate: "2026-11-03" });
  await repo.insert(1, { title: "גם מאוחר", dueDate: "2026-11-20" });
  assert.deepEqual((await repo.list(1)).map((t) => t.title), ["מוקדם", "מאוחר", "גם מאוחר", "בלי תאריך"]);
});

test("list — סינון לפי status", async () => {
  await repo.insert(1, { title: "א", status: "done" });
  await repo.insert(1, { title: "ב" });
  await repo.insert(2, { title: "ג", status: "done" });
  assert.deepEqual((await repo.list(1, "done")).map((t) => t.title), ["א"]);
});

test("countOverdue — לפני היום, לא done, רק של הבעלים", async () => {
  await repo.insert(1, { title: "אתמול", dueDate: "2026-11-04" });
  await repo.insert(1, { title: "היום", dueDate: "2026-11-05" });
  await repo.insert(1, { title: "בוצע באיחור", status: "done", dueDate: "2026-11-01" });
  await repo.insert(1, { title: "בתהליך באיחור", status: "in_progress", dueDate: "2026-10-30" });
  await repo.insert(1, { title: "בלי תאריך" });
  await repo.insert(2, { title: "של יוסי", dueDate: "2026-11-01" });
  assert.equal(await repo.countOverdue(1, "2026-11-05"), 2);
});
