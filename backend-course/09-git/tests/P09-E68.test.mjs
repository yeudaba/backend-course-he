import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E68.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("merge commit בלי התנגשות", (t) => {
  const r = run(t);
  assert.equal(r.git("log", "-1", "--format=%s"), "Merge branch 'feature/prod'");
  assert.equal(r.git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").length, 3);
  assert.equal(r.git("status", "--porcelain"), "");
});
test("שני השינויים בקובץ", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD:config.txt"), "port=80\nhost=localhost\nmode=dev\nlog=info\ncache=on");
});
test("כל ענף שינה שורה אחת", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD^2:config.txt"), "port=80\nhost=localhost\nmode=dev\nlog=info\ncache=off");
  assert.equal(r.git("show", "HEAD^1:config.txt"), "port=3000\nhost=localhost\nmode=dev\nlog=info\ncache=on");
});
