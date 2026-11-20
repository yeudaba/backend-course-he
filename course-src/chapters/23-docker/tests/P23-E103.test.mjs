import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { runScript, tempDir } from "../../tools/shell.mjs";
import { fakeDocker } from "./_fakedocker.mjs";

function project(t, { env }) {
  const dir = tempDir(t, "p23-e103-");
  fs.writeFileSync(path.join(dir, ".env.example"), "JWT_SECRET=change-me\n");
  if (env) fs.writeFileSync(path.join(dir, ".env"), env);
  return dir;
}
const isUp = (c) => c[0] === "compose" && c.includes("up");

test("אין .env ← נוצר, ואז up עם --wait", (t) => {
  const dir = project(t, {});
  const d = fakeDocker(t, [{ match: "^compose up", status: 0 }]);
  const r = runScript(import.meta.url, "P23-E103.sh", [], { cwd: dir, env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(dir, ".env"), "utf8"), "JWT_SECRET=change-me\n");
  assert.ok(r.lines.includes("נוצר .env מ־.env.example"));
  const up = d.calls().find(isUp);
  assert.ok(up, "docker compose up");
  for (const f of ["-d", "--build", "--wait"]) assert.ok(up.includes(f), `docker compose up בלי ${f}${f === "--wait" ? " — ✔ מודפס לפני שהשירותים healthy" : ""}`);
  assert.equal(r.lines.at(-1), "✔ http://localhost:3000");
});
test("יש .env ← לא נוגעים בו", (t) => {
  const dir = project(t, { env: "JWT_SECRET=my-real-secret\n" });
  const d = fakeDocker(t, [{ match: "^compose up", status: 0 }]);
  const r = runScript(import.meta.url, "P23-E103.sh", [], { cwd: dir, env: d.env });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(fs.readFileSync(path.join(dir, ".env"), "utf8"), "JWT_SECRET=my-real-secret\n", ".env קיים נדרס — הסודות של המפתח אבדו");
  assert.ok(!r.lines.includes("נוצר .env מ־.env.example"));
});
test("up נכשל ← לוגים של api, וקוד יציאה 1", (t) => {
  const dir = project(t, { env: "X=1\n" });
  const d = fakeDocker(t, [{ match: "^compose up", status: 1, stderr: "dependency failed to start: container api is unhealthy\n" }, { match: "^compose logs", stdout: "api  | Error: connect ECONNREFUSED\n" }]);
  const r = runScript(import.meta.url, "P23-E103.sh", [], { cwd: dir, env: d.env });
  assert.equal(r.status, 1, "כשה־compose נכשל, הסקריפט חייב להסתיים בקוד 1 — אחרת CI ממשיך");
  const logs = d.calls().find((c) => c[0] === "compose" && c.includes("logs"));
  assert.ok(logs && logs.includes("api") && logs.includes("--tail"), "docker compose logs --tail 50 api");
  assert.ok(!r.lines.includes("✔ http://localhost:3000"), "✔ מודפס גם כשנכשל");
});
