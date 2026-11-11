import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_git.mjs";

const get = () => exportsOf(import.meta.url, "P09-E27.js", ["parseLog", "countTypes"]);
const LOG = "a1b2c3d feat: add login\n9f8e7d6 fix: wrong total\n5a4b3c2 Update README\n1122334 feat: add logout\n";

test("parseLog — hash והודעה מלאה", async () => {
  const { parseLog } = await get();
  const commits = parseLog(LOG);
  assert.equal(commits.length, 4, "4 commits (השורה הריקה בסוף לא נכללת)");
  assert.deepEqual(commits[0], { hash: "a1b2c3d", message: "feat: add login" });
  assert.deepEqual(commits[2], { hash: "5a4b3c2", message: "Update README" }, "ההודעה היא כל מה שאחרי הרווח הראשון");
});
test("parseLog — שורות ריקות באמצע ופלט ריק", async () => {
  const { parseLog } = await get();
  assert.deepEqual(parseLog("abc1234 one\n\n  \ndef5678 two words here"), [
    { hash: "abc1234", message: "one" },
    { hash: "def5678", message: "two words here" },
  ]);
  assert.deepEqual(parseLog(""), []);
});
test("countTypes", async () => {
  const { parseLog, countTypes } = await get();
  assert.deepEqual(countTypes(parseLog(LOG)), { feat: 2, fix: 1, other: 1 });
});
test("countTypes — אותיות גדולות, רווח לפני הנקודתיים, ונקודתיים בהתחלה", async () => {
  const { countTypes } = await get();
  const commits = ["FIX: a", "Fix: b", "Merge branch 'x': conflicts", ": empty", "docs:readme"].map((message) => ({ hash: "x", message }));
  assert.deepEqual(countTypes(commits), { fix: 2, other: 2, docs: 1 });
  assert.deepEqual(countTypes([]), {});
});
