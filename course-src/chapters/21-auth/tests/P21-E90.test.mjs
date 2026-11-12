import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P21-E90.ts", ["InMemoryTasksRepository"])).InMemoryTasksRepository;
const noOwner = (x) => assert.ok(!("ownerId" in x), `ownerId יצא החוצה: ${JSON.stringify(x)}`);

test("insert, list, findById — בלי ownerId", async () => {
  const Repo = await get();
  const r = new Repo();
  const a = r.insert(1, { title: "חלב" });
  const b = r.insert(2, { title: "לחם", done: true });
  const c = r.insert(1, { title: "ביצים" });
  assert.deepEqual(a, { id: 1, title: "חלב", done: false });
  assert.deepEqual(b, { id: 2, title: "לחם", done: true });
  for (const x of [a, b, c]) noOwner(x);
  assert.deepEqual(r.list(1), [{ id: 1, title: "חלב", done: false }, { id: 3, title: "ביצים", done: false }]);
  r.list(1).forEach(noOwner);
  assert.deepEqual(r.list(9), []);
  assert.deepEqual(r.findById(2, 2), { id: 2, title: "לחם", done: true });
  assert.equal(r.findById(1, 2), undefined, "משימה של אחר");
  noOwner(r.findById(1, 1));
});
test("update — רק שלו, ורק title/done", async () => {
  const Repo = await get();
  const r = new Repo();
  r.insert(1, { title: "חלב" });
  assert.equal(r.update(2, 1, { done: true }), undefined, "משתמש 2 מעדכן משימה של 1");
  assert.deepEqual(r.findById(1, 1), { id: 1, title: "חלב", done: false }, "ולא השתנה כלום");
  const u = r.update(1, 1, { done: true });
  assert.deepEqual(u, { id: 1, title: "חלב", done: true });
  noOwner(u);
  r.update(1, 1, { ownerId: 2, id: 50, title: "שונה" });
  assert.deepEqual(r.findById(1, 1), { id: 1, title: "שונה", done: true }, "ownerId ו־id לא משתנים דרך update");
  assert.equal(r.findById(2, 1), undefined);
  assert.equal(r.findById(1, 50), undefined);
});
test("delete", async () => {
  const Repo = await get();
  const r = new Repo();
  r.insert(1, { title: "א" });
  r.insert(1, { title: "ב" });
  assert.equal(r.delete(2, 1), false);
  assert.equal(r.list(1).length, 2);
  assert.equal(r.delete(1, 1), true);
  assert.equal(r.delete(1, 1), false);
  assert.deepEqual(r.list(1).map((t) => t.id), [2]);
});
test("מה שהוחזר הוא עותק", async () => {
  const Repo = await get();
  const r = new Repo();
  const t = r.insert(1, { title: "חלב" });
  t.title = "שונה מבחוץ";
  t.ownerId = 2;
  assert.deepEqual(r.findById(1, 1), { id: 1, title: "חלב", done: false });
  const l = r.list(1);
  l[0].done = true;
  assert.equal(r.findById(1, 1).done, false);
});
