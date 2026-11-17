import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, typecheck, typeProbe } from "./_ts.mjs";

const FILE = "P12-E54.ts";
const get = () => exportsOf(import.meta.url, FILE, ["History", "NothingToUndoError", "NothingToRedoError"]);

test("עובר בדיקת טיפוסים (tsc --strict)", () => {
  const r = typecheck(import.meta.url, FILE);
  assert.ok(r.ok, r.output);
});
test("הטיפוסים", () => {
  const r = typeProbe(import.meta.url, FILE, `import { History } from "FILE";
const h = new History();
h.push("a");
const u: string = h.undo();
const d: string[] = h.done;
// @ts-expect-error — done הוא getter בלבד
h.done = [];
export { u, d };
`);
  assert.ok(r.ok, r.message);
});
test("undo ו־redo", async () => {
  const { History } = await get();
  const h = new History();
  h.push("a");
  h.push("b");
  h.push("c");
  assert.equal(h.undo(), "c");
  assert.equal(h.undo(), "b");
  assert.deepEqual(h.done, ["a"]);
  assert.equal(h.redo(), "b");
  assert.deepEqual(h.done, ["a", "b"]);
  assert.equal(h.redo(), "c");
  assert.deepEqual(h.done, ["a", "b", "c"]);
});
test("push מוחקת את ה־redo", async () => {
  const { History, NothingToRedoError } = await get();
  const h = new History();
  h.push("a");
  h.push("b");
  h.undo();
  h.push("x");
  assert.throws(() => h.redo(), NothingToRedoError);
  assert.deepEqual(h.done, ["a", "x"]);
});
test("שגיאות עם סוג", async () => {
  const { History, NothingToUndoError, NothingToRedoError } = await get();
  const h = new History();
  assert.throws(() => h.undo(), (e) => e instanceof NothingToUndoError && e instanceof Error && e.message === "אין מה לבטל" && e.name === "NothingToUndoError");
  assert.throws(() => h.redo(), (e) => e instanceof NothingToRedoError && e.message === "אין מה לבצע שוב" && e.name === "NothingToRedoError");
  h.push("");
  assert.equal(h.undo(), "", "גם פעולה ריקה היא פעולה");
});
test("done מחזיר עותק", async () => {
  const { History } = await get();
  const h = new History();
  h.push("a");
  h.done.push("hack");
  assert.deepEqual(h.done, ["a"]);
});
