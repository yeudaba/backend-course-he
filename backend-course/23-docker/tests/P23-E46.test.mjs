import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

test("סופר משני הערוצים", (t) => {
  const d = fakeDocker(t, [{ match: "^logs api", stdout: "INFO started\nERROR db down\nINFO GET /tasks\n", stderr: "ERROR timeout\nWARN slow\nERROR again\n" }]);
  const r = runScript(import.meta.url, "P23-E46.sh", ["api"], { env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["3"], "1 ב־stdout + 2 ב־stderr");
  assert.deepEqual(d.calls(), [["logs", "api"]]);
});
test("בלי שגיאות ← 0", (t) => {
  const d = fakeDocker(t, [{ match: "^logs", stdout: "INFO ok\n" }]);
  const r = runScript(import.meta.url, "P23-E46.sh", ["api"], { env: d.env });
  assert.equal(r.status, 0, "אין שגיאות — זה לא כישלון");
  assert.deepEqual(r.lines, ["0"]);
});
test("קונטיינר לא קיים ← exit 1; בלי ארגומנט ← 2", (t) => {
  const d = fakeDocker(t, [{ match: "^logs", stderr: "Error response from daemon: No such container: nope\n", status: 1 }]);
  const r = runScript(import.meta.url, "P23-E46.sh", ["nope"], { env: d.env });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /No such container/);
  assert.deepEqual(r.lines, [], "בלי מספר ב־stdout");
  assert.equal(runScript(import.meta.url, "P23-E46.sh", [], { env: d.env }).status, 2);
});
