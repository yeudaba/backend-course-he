import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E36.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("ב־commit: v1", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Save v1"]);
  assert.equal(r.git("show", "HEAD:notes.txt"), "v1", "ה־commit צריך להכיל את מה שהיה באזור ההכנה — v1");
});
test("בתיקייה: v2, modified", (t) => {
  const r = run(t);
  assert.equal(r.read("notes.txt"), "v2\n");
  assert.equal(r.git("status", "--porcelain"), " M notes.txt");
});
