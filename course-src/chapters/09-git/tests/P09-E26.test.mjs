import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E26.sh";

test("שלושה commits, בסדר הנכון", (t) => {
  const run = runGitScript(t, import.meta.url, FILE);
  assertRepo(run);
  assert.deepEqual(run.git("log", "--format=%s").split("\n"), ["Add second note", "Add notes", "Add README"], "ההודעות של git log (מהחדש לישן)");
});
test("המאגר עוקב בדיוק אחרי שלושה קבצים", (t) => {
  const run = runGitScript(t, import.meta.url, FILE);
  assertRepo(run);
  const files = run.git("ls-files").split("\n").sort();
  assert.ok(!files.includes("app.log"), "app.log נכנס למאגר — הוא צריך להיות ב־.gitignore לפני ה־git add");
  assert.deepEqual(files, [".gitignore", "README.md", "notes.txt"]);
});
test("תוכן הקבצים", (t) => {
  const run = runGitScript(t, import.meta.url, FILE);
  assertRepo(run);
  assert.equal(run.git("show", "HEAD~2:README.md"), "# Notes", "README.md ב־commit הראשון");
  assert.equal(run.git("show", "HEAD~1:notes.txt"), "first note", "notes.txt ב־commit השני (שורה אחת)");
  assert.equal(run.git("show", "HEAD:notes.txt"), "first note\nsecond note", "notes.txt ב־commit השלישי (השורה השנייה נוספה בסוף, עם >>)");
  assert.equal(run.git("show", "HEAD:.gitignore"), "*.log");
});
test("בסוף: app.log קיים בתיקייה, ואין שינויים שלא נשמרו", (t) => {
  const run = runGitScript(t, import.meta.url, FILE);
  assertRepo(run);
  assert.notEqual(run.read("app.log"), null, "app.log צריך להיות קיים בתיקייה (הוא רק לא במאגר)");
  assert.equal(run.git("status", "--porcelain"), "", "git status צריך להיות נקי (working tree clean)");
});
