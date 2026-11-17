import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E48.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("commit אחד בשם Add app", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add app"], "צריך להיות commit אחד — השתמש ב־--amend");
});
test("שני הקבצים בו", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD").split("\n").sort(), ["app.js", "utils.js"]);
  assert.equal(r.git("show", "HEAD:app.js"), 'require("./utils")');
  assert.equal(r.git("show", "HEAD:utils.js"), "module.exports = {};");
  assert.equal(r.git("status", "--porcelain"), "");
});
