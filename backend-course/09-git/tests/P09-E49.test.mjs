import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E49.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("שני commits", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Stop tracking log and env", "Initial commit"]);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD~1").split("\n").sort(), [".env", "app.js", "debug.log"], "ה־commit הראשון — עם שלושת הקבצים (הטעות)");
});
test("ב־HEAD רק .gitignore ו־app.js", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD").split("\n").sort(), [".gitignore", "app.js"]);
  assert.deepEqual(r.git("show", "HEAD:.gitignore").split("\n").sort(), ["*.log", ".env"]);
});
test("הקבצים עדיין בדיסק, status נקי", (t) => {
  const r = run(t);
  assert.equal(r.read(".env"), "API_KEY=123\n", ".env נמחק מהדיסק — צריך git rm --cached");
  assert.equal(r.read("debug.log"), "trace\n");
  assert.equal(r.git("status", "--porcelain"), "");
});
