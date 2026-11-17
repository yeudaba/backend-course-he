import { test } from "node:test";
import assert from "node:assert/strict";
import { runGitScript, assertRepo } from "./_git.mjs";

const FILE = "P09-E75.sh";
// מריץ את הסקריפט שלך בתיקייה ריקה ובודק שנוצר מאגר עם commit
const run = (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assertRepo(r);
  return r;
};

test("השרת ושני המחשבים מסונכרנים", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  const expected = ["Add todo", "Add README"];
  for (const where of ["server.git", "laptop", "desktop"]) {
    const log = r.git("-C", where, "log", "--format=%s", "main");
    assert.deepEqual(log === null ? null : log.split("\n"), expected, `ב־${where} צריכים להיות שני ה־commits.\n${r.output}`);
  }
});
test("הקבצים ב־laptop אחרי ה־pull", (t) => {
  const r = runGitScript(t, import.meta.url, FILE);
  assert.equal(r.read("laptop/todo.txt"), "buy milk\n", "todo.txt צריך להגיע ל־laptop דרך git pull");
  assert.equal(r.read("laptop/README.md"), "# Notes\n");
  assert.equal(r.read("laptop/desktop/todo.txt"), null, "desktop נוצר בתוך laptop — חסר cd ..");
});
