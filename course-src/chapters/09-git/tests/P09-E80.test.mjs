import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E80.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("main בשרת — merge commit של הענף", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.equal(r.git("-C", "server.git", "log", "-1", "--format=%s", "main"), "Merge branch 'feature/usage'", `ב־main של השרת צריך להיות merge commit.\n${r.output}`);
  assert.equal(r.git("-C", "server.git", "rev-list", "--parents", "-n", "1", "main").split(" ").length, 3, "merge commit עם שני הורים — השתמש ב־--no-ff");
  assert.equal(r.git("-C", "server.git", "show", "main:README.md"), "# App\nRun: node index.js");
});
test("הענף נדחף לשרת", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.equal(r.git("-C", "server.git", "log", "-1", "--format=%s", "feature/usage"), "Add usage to README");
});
test("מקומית: רק main, מסונכרן", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.equal(r.git("-C", "app", "branch", "--format=%(refname:short)"), "main", "הענף המקומי feature/usage צריך להימחק");
  assert.equal(r.git("-C", "app", "status", "--porcelain"), "");
  assert.equal(r.git("-C", "app", "rev-parse", "main"), r.git("-C", "server.git", "rev-parse", "main"), "חסר git push אחרי המיזוג");
});
