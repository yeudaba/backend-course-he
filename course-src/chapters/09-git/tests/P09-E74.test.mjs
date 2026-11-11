import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E74.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("השרת קיבל את ה־commit", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.ok(r.git("-C", "server.git", "rev-parse", "--is-bare-repository") === "true", `לא נוצר מאגר bare בשם server.git.\n${r.output}`);
  assert.equal(r.git("-C", "server.git", "log", "--format=%s", "main"), "Add README", "ב־main של השרת צריך להיות ה־commit");
  assert.equal(r.git("-C", "server.git", "show", "main:README.md"), "# Shop");
});
test("origin ו־upstream", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.equal(r.git("-C", "project", "remote", "get-url", "origin"), "../server.git");
  assert.equal(r.git("-C", "project", "rev-parse", "--abbrev-ref", "main@{upstream}"), "origin/main", "חסר -u ב־push");
  assert.equal(r.git("-C", "project", "status", "--porcelain"), "");
});
