import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E37.js";
const get = () => exportsOf(import.meta.url, FILE, ["checkMessage"]);

test("הודעה טובה", async () => {
  const { checkMessage } = await get();
  assert.deepEqual(checkMessage("Add monthly summary command"), []);
  assert.deepEqual(checkMessage("  Fix crash when file is empty  "), []);
});
test("ריקה — רק הבעיה הזו", async () => {
  const { checkMessage } = await get();
  assert.deepEqual(checkMessage(""), ["הודעה ריקה"]);
  assert.deepEqual(checkMessage("   "), ["הודעה ריקה"]);
});
test("הודעה כללית", async () => {
  const { checkMessage } = await get();
  assert.deepEqual(checkMessage("WIP"), ["לא אומרת מה השתנה"]);
  assert.deepEqual(checkMessage("Update"), ["לא אומרת מה השתנה"]);
  assert.deepEqual(checkMessage("fix"), ["לא אומרת מה השתנה", "מתחילה באות קטנה"]);
  assert.deepEqual(checkMessage("Update README"), [], "רק כשכל ההודעה היא המילה הכללית");
});
test("אורך, אות קטנה, נקודה", async () => {
  const { checkMessage } = await get();
  assert.deepEqual(checkMessage("fixed the bug."), ["מתחילה באות קטנה", "נגמרת בנקודה"]);
  assert.deepEqual(checkMessage("A".repeat(50)), []);
  assert.deepEqual(checkMessage("A".repeat(51)), ["ארוכה מ־50 תווים"]);
  assert.deepEqual(checkMessage("תיקון באג"), [], "אות עברית היא לא אות אנגלית קטנה");
});
