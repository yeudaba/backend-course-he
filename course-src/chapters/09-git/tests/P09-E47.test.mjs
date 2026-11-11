import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E47.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("ארבעה commits, האחרון הוא revert", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ['Revert "Change VAT to 0.71"', "Add README", "Change VAT to 0.71", "Add VAT"]);
});
test("vat.txt חזר, README נשאר", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD:vat.txt"), "0.17");
  assert.equal(r.git("show", "HEAD:README.md"), "# Shop");
  assert.equal(r.git("show", "HEAD~2:vat.txt"), "0.71", "ה־commit עם הטעות נשאר בהיסטוריה");
  assert.equal(r.git("status", "--porcelain"), "");
});
