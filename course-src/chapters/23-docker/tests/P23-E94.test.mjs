import { test } from "node:test";
import assert from "node:assert/strict";
import { runScript } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

const env = (d) => ({ ...d.env, POLL_INTERVAL: "0.1" });

test("starting ← healthy", (t) => {
  const d = fakeDocker(t, [{ match: "^inspect", seq: [{ stdout: "starting\n" }, { stdout: "starting\n" }, { stdout: "healthy\n" }] }]);
  const r = runScript(import.meta.url, "P23-E94.sh", ["api-1", "5"], { env: env(d) });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["healthy"]);
  const calls = d.calls();
  assert.equal(calls.length, 3, "שלוש בדיקות");
  assert.deepEqual(calls[0], ["inspect", "-f", "{{.State.Health.Status}}", "api-1"]);
});
test("unhealthy ← מיד exit 1", (t) => {
  const d = fakeDocker(t, [{ match: "^inspect", seq: [{ stdout: "starting\n" }, { stdout: "unhealthy\n" }, { stdout: "healthy\n" }] }]);
  const t0 = Date.now();
  const r = runScript(import.meta.url, "P23-E94.sh", ["api-1", "10"], { env: env(d) });
  assert.equal(r.status, 1);
  assert.equal(d.calls().length, 2, "לא ממשיכים אחרי unhealthy");
  assert.ok(Date.now() - t0 < 4000);
});
test("שגיאה של docker ← ממשיכים; timeout", (t) => {
  const d = fakeDocker(t, [{ match: "^inspect", seq: [{ stderr: "Error: No such object: api-1\n", status: 1 }, { stdout: "healthy\n" }] }]);
  assert.equal(runScript(import.meta.url, "P23-E94.sh", ["api-1", "5"], { env: env(d) }).status, 0, "קונטיינר שעוד לא קיים — מחכים");
  const d2 = fakeDocker(t, [{ match: "^inspect", stdout: "starting\n" }]);
  const t0 = Date.now();
  const r = runScript(import.meta.url, "P23-E94.sh", ["db-1", "1"], { env: env(d2) });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /timeout: db-1 לא healthy/);
  assert.ok(Date.now() - t0 < 4000, "timeout של שנייה");
});
test("ארגומנטים", (t) => {
  const d = fakeDocker(t, []);
  for (const args of [[], ["a"], ["a", "0"], ["a", "-1"], ["a", "x"], ["a", "1.5"], ["a", "1", "2"]]) {
    assert.equal(runScript(import.meta.url, "P23-E94.sh", args, { env: env(d) }).status, 2, JSON.stringify(args));
  }
});
