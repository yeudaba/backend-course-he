import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E59.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("main כולל את שני ה־commits, בלי merge commit", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s", "main").split("\n"), ["Add about page", "Add README"]);
  assert.equal(r.git("rev-list", "--merges", "--count", "main"), "0", "fast-forward — בלי merge commit");
  assert.equal(r.git("show", "main:about.md"), "# About");
});
test("הענף נמחק, ואנחנו ב־main", (t) => {
  const r = run(t);
  assert.equal(r.git("branch", "--format=%(refname:short)"), "main", "רק main צריך להישאר");
  assert.equal(r.git("branch", "--show-current"), "main");
});
