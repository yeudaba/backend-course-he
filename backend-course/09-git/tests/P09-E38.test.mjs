import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E38.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("שלושה commits בסדר הנכון", (t) => {
  const r = run(t);
  assert.deepEqual(r.git("log", "--format=%s").split("\n"), ["Add index.js", "Add start script", "Add package.json"]);
});
test("package.json בכל שלב", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD~2:package.json"), '{"name":"demo"}');
  assert.equal(r.git("show", "HEAD~1:package.json"), '{"name":"demo","scripts":{"start":"node index.js"}}');
  assert.equal(r.git("show", "HEAD:package.json"), '{"name":"demo","scripts":{"start":"node index.js"}}');
  assert.deepEqual(r.git("diff", "--name-only", "HEAD~1", "HEAD").split("\n"), ["index.js"], "ה־commit האחרון מוסיף רק את index.js");
});
test("index.js", (t) => {
  const r = run(t);
  assert.equal(r.git("show", "HEAD:index.js"), 'console.log("hi")');
  assert.equal(r.git("show", "HEAD~1:index.js"), null, "index.js לא צריך להיות ב־commit השני");
});
test("scratch.txt נשאר untracked", (t) => {
  const r = run(t);
  assert.notEqual(r.read("scratch.txt"), null, "scratch.txt צריך להיות בתיקייה");
  assert.equal(r.git("status", "--porcelain"), "?? scratch.txt");
});
