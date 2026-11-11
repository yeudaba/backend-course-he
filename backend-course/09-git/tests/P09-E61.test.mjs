import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E61.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("merge commit עם שני הורים", (t) => {
  const r = run(t);
  assert.equal(r.git("log", "-1", "--format=%s"), "Merge branch 'feature/hebrew'");
  assert.equal(r.git("rev-list", "--parents", "-n", "1", "HEAD").split(" ").length, 3);
});
test("הקובץ פתור — בלי סימני התנגשות", (t) => {
  const r = run(t);
  const text = r.git("show", "HEAD:greeting.txt") ?? "";
  assert.doesNotMatch(text, /<<<<<<<|=======|>>>>>>>/, "נשארו סימני התנגשות בקובץ");
  assert.equal(text, "Hello! / שלום");
  assert.equal(r.git("status", "--porcelain"), "");
});
test("שני הצדדים בהיסטוריה", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD^1:greeting.txt"), "Hello!");
  assert.equal(r.git("show", "HEAD^2:greeting.txt"), "שלום");
});
