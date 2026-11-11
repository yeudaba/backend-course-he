import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf, code } from "./_src.mjs";

const FILE = "P06-E38.js";
const get = () => exportsOf(import.meta.url, FILE, ["doAction","undo","redo"]);
// הקוד שלך בלי הערות
const src = () => code(import.meta.url, FILE);

test("undo ו־redo מעבירים בין המחסניות", async () => {
  const { doAction, undo, redo } = await get();
  const history = [];
  const redoStack = [];
  doAction(history, redoStack, "A");
  doAction(history, redoStack, "B");
  assert.deepEqual(history, ["A", "B"]);
  assert.equal(undo(history, redoStack), "B", "undo מבטל את הפעולה האחרונה");
  assert.deepEqual(history, ["A"]);
  assert.deepEqual(redoStack, ["B"]);
  assert.equal(undo(history, redoStack), "A");
  assert.deepEqual(redoStack, ["B", "A"]);
  assert.equal(redo(history, redoStack), "A", "redo מחזיר את מה שבוטל אחרון");
  assert.equal(redo(history, redoStack), "B");
  assert.deepEqual(history, ["A", "B"]);
  assert.deepEqual(redoStack, []);
});
test("אין מה לבטל / לבצע שוב ← null", async () => {
  const { undo, redo } = await get();
  const history = [];
  const redoStack = [];
  assert.equal(undo(history, redoStack), null);
  assert.equal(redo(history, redoStack), null);
  assert.deepEqual(history, [], "אסור להכניס null או undefined למחסנית");
  assert.deepEqual(redoStack, []);
});
test("פעולה חדשה מרוקנת את redoStack — את המערך עצמו", async () => {
  const { doAction, undo, redo } = await get();
  const history = ["x", "y", "z"];
  const redoStack = [];
  undo(history, redoStack);
  undo(history, redoStack);
  doAction(history, redoStack, "w");
  assert.deepEqual(redoStack, [], "אחרי doAction המערך redoStack (שהעברת) צריך להיות ריק");
  assert.deepEqual(history, ["x", "w"]);
  assert.equal(redo(history, redoStack), null);
});
