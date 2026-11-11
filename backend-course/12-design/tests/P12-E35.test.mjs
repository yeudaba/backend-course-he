import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E35.ts";
const get = async () => (await exportsOf(import.meta.url, FILE, ["TodoList"])).TodoList;

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { TodoList } from "FILE";
import type { Todo } from "FILE";
const l = new TodoList();
const id: number = l.add("x");
const p: string[] = l.pending;
const all: Todo[] = l.all();
const ok: boolean = l.remove(id);
// @ts-expect-error — pending הוא getter בלבד
l.pending = [];
export { all, ok };
`);
  assert.ok(r.ok, r.message);
});
test("add, complete, pending", async () => {
  const TodoList = await get();
  const l = new TodoList();
  assert.equal(l.add(" לקנות חלב "), 1);
  assert.equal(l.add("לשלם"), 2);
  assert.equal(l.add("לצלצל"), 3);
  l.complete(2);
  assert.deepEqual(l.pending, ["לקנות חלב", "לצלצל"]);
  assert.deepEqual(l.all(), [
    { id: 1, title: "לקנות חלב", done: false },
    { id: 2, title: "לשלם", done: true },
    { id: 3, title: "לצלצל", done: false },
  ]);
  assert.throws(() => l.add("   "), { message: "כותרת ריקה" });
  assert.throws(() => l.complete(9), { message: "משימה 9 לא קיימת" });
});
test("remove — ומזהים לא חוזרים", async () => {
  const TodoList = await get();
  const l = new TodoList();
  l.add("a");
  l.add("b");
  assert.equal(l.remove(2), true);
  assert.equal(l.remove(2), false);
  assert.equal(l.add("c"), 3, "אחרי מחיקה המזהה הבא הוא 3 — לא 2");
  assert.deepEqual(l.pending, ["a", "c"]);
});
test("all מחזירה עותקים, ולכל רשימה מזהים משלה", async () => {
  const TodoList = await get();
  const l = new TodoList();
  l.add("a");
  const copy = l.all();
  copy[0].done = true;
  copy[0].title = "x";
  copy.push({ id: 99, title: "y", done: false });
  assert.deepEqual(l.pending, ["a"], "שינוי של מה ש־all() החזירה שינה את הרשימה");
  const other = new TodoList();
  assert.equal(other.add("z"), 1, "לכל רשימה מונה משלה (שדה, לא static)");
  assert.deepEqual(Object.keys(l), [], "השדות צריכים להיות פרטיים (#)");
});
