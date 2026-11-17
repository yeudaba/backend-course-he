import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const FILE = "P09-E42.js";
const get = () => exportsOf(import.meta.url, FILE, ["parseStatus"]);

test("שלוש הקבוצות", async () => {
  const { parseStatus } = await get();
  assert.deepEqual(parseStatus("A  README.md\n M app.js\nMM cart.js\n?? notes.txt\n"), {
    staged: ["README.md", "cart.js"],
    modified: ["app.js", "cart.js"],
    untracked: ["notes.txt"],
  });
});
test("מחיקה ושמות עם תיקיות", async () => {
  const { parseStatus } = await get();
  assert.deepEqual(parseStatus(" D old.js\nD  gone.js\n?? src/new file.js"), {
    staged: ["gone.js"],
    modified: ["old.js"],
    untracked: ["src/new file.js"],
  });
});
test("ריק", async () => {
  const { parseStatus } = await get();
  assert.deepEqual(parseStatus(""), { staged: [], modified: [], untracked: [] });
});
