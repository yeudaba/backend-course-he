import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E60.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("merge commit עם שני הורים", (t) => {
  const r = run(t);
  assert.equal(r.git("log", "-1", "--format=%s"), "Merge branch 'feature/a'");
  assert.equal(r.git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").length, 3, "ל־merge commit יש שני הורים");
});
test("שני הצדדים התפצלו מ־Add app", (t) => {
  const r = run(t);
  assert.equal(r.git("log", "-1", "--format=%s", "HEAD^1"), "Add b", "ההורה הראשון — הקצה של main");
  assert.equal(r.git("log", "-1", "--format=%s", "HEAD^2"), "Add a", "ההורה השני — הקצה של feature/a");
  assert.equal(r.git("log", "-1", "--format=%s", "HEAD^2~1"), "Add app");
});
test("כל הקבצים במקום", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD").split("\n").sort(), ["a.txt", "app.js", "b.txt"]);
  assert.equal(r.git("status", "--porcelain"), "");
});
