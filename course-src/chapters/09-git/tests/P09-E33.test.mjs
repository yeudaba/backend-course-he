import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E33.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("commit אחד בשם Add hello", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add hello"]);
});
test("hello.txt ב־commit", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD:hello.txt"), "hello git");
  assert.equal(r.git("status", "--porcelain"), "", "git status צריך להיות נקי");
});
