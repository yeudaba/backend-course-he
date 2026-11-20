import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const run = (t) => {
  const r = runGitScript(t, import.meta.url, "P09-E81.sh");
  assertRepo(r);
  return r;
};

test("שני commits, בסדר הנכון", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add config", "Add README"], "צריכים להיות בדיוק שני commits: Add README ואז Add config");
});
test("Add README: רק README.md, עם שתי השורות", (t) => {
  const r = run(t);
  const first = r.git("rev-list", "--max-parents=0", "HEAD");
  assert.deepEqual(r.git("ls-tree", "--name-only", first).split("\n"), ["README.md"]);
  assert.equal(r.git("show", `${first}:README.md`), "# קפה הפינה\nשעות: 8–20", "ב־commit הראשון חסרה שורה — add שומר צילום של הקובץ ברגע שהוא רץ");
});
test("Add config: רק config.txt נוסף", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD").split("\n"), ["config.txt"]);
  assert.equal(r.git("show", "HEAD:config.txt"), "port=3000");
});
test("secrets.txt לא נכנס לאף commit, ונשאר בתיקייה", (t) => {
  const r = run(t);
  assert.equal(r.git("log", "--all", "--format=%h", "--", "secrets.txt"), "", "secrets.txt נכנס ל־commit — הסיסמה בהיסטוריה");
  assert.equal(r.read("secrets.txt"), "password=1234\n");
  assert.equal(r.git("status", "--porcelain"), "?? secrets.txt", "בסוף רק secrets.txt צריך להיות untracked, ושום דבר לא שונה");
});
