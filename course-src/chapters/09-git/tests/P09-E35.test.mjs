import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E35.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("ב־commit רק a.txt", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add a"]);
  assert.deepEqual(r.git("ls-tree", "--name-only", "HEAD").split("\n"), ["a.txt"], "רק a.txt צריך להיות ב־commit");
  assert.equal(r.git("show", "HEAD:a.txt"), "A");
});
test("b.txt נשאר untracked", (t) => {
  const r = run(t);
  assert.equal(r.read("b.txt"), "B\n", "b.txt צריך להיות קיים בתיקייה");
  assert.equal(r.git("status", "--porcelain"), "?? b.txt");
});
