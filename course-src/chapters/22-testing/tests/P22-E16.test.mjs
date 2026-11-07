import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { load } from "../../tools/load.mjs";

const { aUser, aTask, resetBuilders } = await load(import.meta.url, "P22-E16.ts");
beforeEach(() => resetBuilders());

test("ברירות מחדל תקינות", () => {
  assert.deepEqual(aUser(), { id: 1, email: "user1@example.com", role: "user", createdAt: "2026-11-01T00:00:00.000Z" });
  assert.deepEqual(aTask(), { id: 1, ownerId: 1, title: "משימה 1", status: "todo", priority: "medium", dueDate: null });
});
test("ids ואימיילים ייחודיים", () => {
  const users = [aUser(), aUser(), aUser()];
  assert.deepEqual(users.map((u) => u.id), [1, 2, 3]);
  assert.equal(new Set(users.map((u) => u.email)).size, 3);
  assert.deepEqual([aTask().id, aTask().id], [1, 2], "מונה נפרד למשימות");
});
test("overrides", () => {
  assert.deepEqual(aUser({ role: "admin" }), { id: 1, email: "user1@example.com", role: "admin", createdAt: "2026-11-01T00:00:00.000Z" });
  const admin = aUser({ id: 50 });
  assert.equal(admin.email, "user50@example.com", "האימייל לפי ה־id שנבחר");
  assert.deepEqual(aTask({ ownerId: admin.id, status: "done" }), { id: 1, ownerId: 50, title: "משימה 1", status: "done", priority: "medium", dueDate: null });
});
test("resetBuilders", () => {
  aUser();
  aTask();
  resetBuilders();
  assert.equal(aUser().id, 1);
  assert.equal(aTask().id, 1);
});
