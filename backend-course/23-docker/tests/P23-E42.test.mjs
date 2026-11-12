import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

const LIST = "demo-1\nold-demo-2\ndemo-api\nprod-db\ndemo*x\ndemo-3\n";

test("מוחק רק מה שמתחיל ב־prefix", (t) => {
  const d = fakeDocker(t, [{ match: "^ps", stdout: LIST }]);
  const r = runScript(import.meta.url, "P23-E42.sh", ["demo-"], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["demo-1", "demo-api", "demo-3", "removed 3"]);
  const calls = d.calls();
  assert.ok(calls[0].includes("status=exited") && calls[0].includes("-a"), "docker ps -a --filter status=exited");
  assert.deepEqual(calls.slice(1), [["rm", "demo-1"], ["rm", "demo-api"], ["rm", "demo-3"]]);
});
test("prefix עם תו מיוחד — כטקסט", (t) => {
  const d = fakeDocker(t, [{ match: "^ps", stdout: LIST }]);
  const r = runScript(import.meta.url, "P23-E42.sh", ["demo*"], { env: d.env });
  assert.deepEqual(r.lines, ["demo*x", "removed 1"]);
});
test("אין מה למחוק / ארגומנטים", (t) => {
  const d = fakeDocker(t, [{ match: "^ps", stdout: "" }]);
  const r = runScript(import.meta.url, "P23-E42.sh", ["demo-"], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["removed 0"]);
  const d2 = fakeDocker(t, [{ match: "^ps", stdout: LIST }]);
  assert.equal(runScript(import.meta.url, "P23-E42.sh", [], { env: d2.env }).status, 2);
  assert.equal(runScript(import.meta.url, "P23-E42.sh", [""], { env: d2.env }).status, 2, "prefix ריק — לא מוחקים הכול");
  assert.ok(!d2.calls().some((c) => c[0] === "rm"));
});
