import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

const run = (d, args) => runScript(import.meta.url, "P23-E91.sh", args, { env: d.env });

test("פקודות", (t) => {
  const cases = [
    [["up"], [["compose", "up", "-d", "--build", "--wait"]]],
    [["down"], [["compose", "down"]]],
    [["seed"], [["compose", "run", "--rm", "migrate", "npm", "run", "db:seed"]]],
    [["logs"], [["compose", "logs", "-f"]]],
    [["logs", "api"], [["compose", "logs", "-f", "api"]]],
    [["psql"], [["compose", "exec", "db", "psql", "-U", "tasks", "tasks"]]],
    [["reset", "-y"], [["compose", "down", "-v"], ["compose", "up", "-d", "--build", "--wait"]]],
  ];
  for (const [args, want] of cases) {
    const d = fakeDocker(t, []);
    const r = run(d, args);
    assert.equal(r.status, 0, `${args.join(" ")}: ${r.stderr}`);
    assert.deepEqual(d.calls(), want, `dc.sh ${args.join(" ")}`);
  }
});
test("reset בלי -y, ופקודות לא מוכרות", (t) => {
  const d = fakeDocker(t, []);
  const r = run(d, ["reset"]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /reset מוחק את המסד\. הרץ: dc\.sh reset -y/);
  assert.equal(run(d, ["reset", "yes"]).status, 1);
  assert.equal(run(d, []).status, 2);
  assert.equal(run(d, ["deploy"]).status, 2);
  assert.deepEqual(d.calls(), [], "שום docker לא רץ");
});
test("כישלון של docker עובר הלאה", (t) => {
  const d = fakeDocker(t, [{ match: "^compose down -v", status: 1 }]);
  assert.notEqual(run(d, ["reset", "-y"]).status, 0);
  assert.equal(d.calls().length, 1, "down -v נכשל ← לא מעלים");
});
