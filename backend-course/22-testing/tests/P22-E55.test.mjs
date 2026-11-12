import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = () => exportsOf(import.meta.url, "P22-E55.ts", ["aUser", "aTask", "resetBuilders"]);
const C = "2026-11-04T10:00:00.000Z";

test("ברירות מחדל ומונים", async () => {
  const { aUser, aTask, resetBuilders } = await get();
  resetBuilders();
  assert.deepEqual(aUser(), { id: 1, email: "user1@example.com", role: "user", createdAt: C });
  assert.deepEqual(aUser({ role: "admin" }), { id: 2, email: "user2@example.com", role: "admin", createdAt: C });
  assert.deepEqual(aTask(), { id: 1, ownerId: 1, title: "משימה 1", status: "todo", dueDate: null, createdAt: C }, "מונה נפרד ל־Task");
  assert.deepEqual(aTask({ ownerId: 2, status: "done", dueDate: "2026-11-01" }), { id: 2, ownerId: 2, title: "משימה 2", status: "done", dueDate: "2026-11-01", createdAt: C });
});
test("id מה־overrides — והמונה ממשיך", async () => {
  const { aUser, aTask, resetBuilders } = await get();
  resetBuilders();
  assert.deepEqual(aUser({ id: 7 }), { id: 7, email: "user7@example.com", role: "user", createdAt: C }, "email לפי ה־id הסופי");
  assert.equal(aUser().id, 2, "המונה התקדם גם כשה־id הגיע מבחוץ");
  assert.equal(aUser({ email: "dana@example.com" }).email, "dana@example.com");
  aTask({ id: 50 });
  assert.equal(aTask().id, 2);
});
test("resetBuilders ואובייקטים חדשים", async () => {
  const { aUser, aTask, resetBuilders } = await get();
  aUser(); aUser(); aTask();
  resetBuilders();
  assert.equal(aUser().id, 1);
  assert.equal(aTask().id, 1);
  const a = aTask({ ownerId: 3 });
  const b = aTask({ ownerId: 3 });
  assert.notEqual(a.id, b.id, "ids ייחודיים");
  a.title = "שונה";
  assert.equal(aTask().title.startsWith("משימה"), true);
});
