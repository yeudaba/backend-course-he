import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, steps, stepIndex } from "./_workflow.mjs";

const { wf, on } = readWorkflow(import.meta.url, "P25-E42.yml");
const job = wf.jobs?.docker;

test("מבנה", () => {
  assert.deepEqual([on?.pull_request?.branches].flat(), ["main"]);
  assert.deepEqual(wf.permissions, { contents: "read" });
  assert.ok(job, "job בשם docker");
  assert.equal(job["runs-on"], "ubuntu-latest");
  assert.ok(Number(job["timeout-minutes"]) > 0 && Number(job["timeout-minutes"]) <= 30);
});
test("הצעדים, בסדר", () => {
  const s = steps(job);
  assert.match(s[0]?.uses ?? "", /^actions\/checkout@v\d+$/);
  const build = stepIndex(job, /docker build\b.*-t tasks-api:ci\b.*\s\.$/);
  const run = stepIndex(job, /docker run\b/);
  const curl = stepIndex(job, /\bcurl\b/);
  const logs = stepIndex(job, /docker logs api\b/);
  assert.ok(build > 0, "docker build -t tasks-api:ci .");
  assert.ok(run > build, "docker run אחרי build");
  assert.ok(curl > run, "curl אחרי run");
  assert.ok(logs > curl, "docker logs בסוף");
});
test("docker run", () => {
  const cmd = steps(job)[stepIndex(job, /docker run\b/)].run.replace(/\s+/g, " ");
  assert.match(cmd, /\s-d\b/, "-d — ברקע");
  assert.match(cmd, /--name[ =]api\b/);
  assert.match(cmd, /-p 3000:3000\b/);
  const secret = /-e JWT_SECRET=(\S+)/.exec(cmd);
  assert.ok(secret, "-e JWT_SECRET=...");
  assert.ok(secret[1].length >= 32, "ערך בדיקה של 32 תווים לפחות");
  assert.doesNotMatch(cmd, /secrets\./, "לא סוד אמיתי");
  assert.match(cmd, /tasks-api:ci\s*$/, "ה־image בסוף");
});
test("curl ו־docker logs", () => {
  const s = steps(job);
  const curl = s[stepIndex(job, /\bcurl\b/)].run;
  assert.match(curl, /http:\/\/localhost:3000\/health/);
  assert.match(curl, /(^|\s)-[a-zA-Z]*f/, "-f — נכשל על 4xx/5xx");
  assert.match(curl, /--retry\s+\d+/, "--retry");
  const logs = s[stepIndex(job, /docker logs api\b/)];
  assert.match(String(logs.if ?? ""), /always\(\)/, "if: always()");
});
