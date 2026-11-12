import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runScript, tempDir } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

const LONG = "x".repeat(20) + "=" + "y".repeat(20);
function project(t, env) {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, ".env.example"), "JWT_SECRET=\nAPI_PORT=3000\n");
  if (env !== undefined) fs.writeFileSync(path.join(dir, ".env"), env);
  return dir;
}

test("אין .env ← נוצר מהדוגמה, exit 1", (t) => {
  const d = fakeDocker(t, []);
  const dir = project(t);
  const r = runScript(import.meta.url, "P23-E90.sh", [], { cwd: dir, env: d.env });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /נוצר \.env — הגדר בו JWT_SECRET/);
  assert.equal(fs.readFileSync(path.join(dir, ".env"), "utf8"), "JWT_SECRET=\nAPI_PORT=3000\n");
  assert.deepEqual(d.calls(), [], "לא מריצים docker");
});
test("סוד קצר ← exit 1", (t) => {
  const d = fakeDocker(t, []);
  for (const env of ["API_PORT=3000\n", "JWT_SECRET=short\n", `# JWT_SECRET=${LONG}\nJWT_SECRET=${"a".repeat(31)}\n`]) {
    const r = runScript(import.meta.url, "P23-E90.sh", [], { cwd: project(t, env), env: d.env });
    assert.equal(r.status, 1, JSON.stringify(env));
    assert.match(r.stderr, /JWT_SECRET קצר מ־32 תווים/);
  }
  assert.deepEqual(d.calls(), []);
});
test("עולה", (t) => {
  const d = fakeDocker(t, [{ match: "^compose up", status: 0 }]);
  const r = runScript(import.meta.url, "P23-E90.sh", [], { cwd: project(t, `API_PORT=4000\nJWT_SECRET=${LONG}\n`), env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(r.lines, ["הכול עלה"]);
  assert.deepEqual(d.calls(), [["compose", "up", "-d", "--build", "--wait"]], "סוד עם = באמצע — 41 תווים (cut -f2-)");
});
test("נכשל ← logs, exit 1", (t) => {
  const d = fakeDocker(t, [{ match: "^compose up", status: 1, stderr: "container api is unhealthy\n" }, { match: "^compose logs", stdout: "api-1 | Error: הגדרות לא תקינות\n" }]);
  const r = runScript(import.meta.url, "P23-E90.sh", [], { cwd: project(t, `JWT_SECRET=${"s".repeat(40)}\n`), env: d.env });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /הגדרות לא תקינות/, "מראים את הלוגים");
  assert.deepEqual(d.calls().at(-1), ["compose", "logs", "--no-color", "--tail", "50"]);
  assert.doesNotMatch(r.stdout, /הכול עלה/);
});
