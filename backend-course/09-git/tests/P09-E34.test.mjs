import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E34.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("commit אחד", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add app skeleton"]);
});
test("שני הקבצים ב־commit, עם התוכן הנכון", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD").split("\n").sort(), ["README.md", "index.js"]);
  assert.equal(r.git("show", "HEAD:index.js"), 'console.log("start")', "שים לב למירכאות — ראה רמז 2");
  assert.equal(r.git("show", "HEAD:README.md"), "# Skeleton");
});
