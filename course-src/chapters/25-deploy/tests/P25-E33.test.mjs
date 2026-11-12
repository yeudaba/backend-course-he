import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, steps, stepIndex } from "./_workflow.mjs";

const { wf, on } = readWorkflow(import.meta.url, "P25-E33.yml");
const timeoutOk = (job) => Number(job?.["timeout-minutes"]) > 0 && Number(job?.["timeout-minutes"]) <= 30;

test("מתי רץ, והרשאות", () => {
  assert.deepEqual([on?.push?.branches].flat(), ["main"]);
  assert.deepEqual([on?.pull_request?.branches].flat(), ["main"]);
  assert.deepEqual(wf.permissions, { contents: "read" });
});
test("שלושה jobs בשמות הנכונים", () => {
  assert.deepEqual(Object.keys(wf.jobs).sort(), ["deploy", "docker", "test"]);
  for (const [name, job] of Object.entries(wf.jobs)) {
    assert.equal(job["runs-on"], "ubuntu-latest", name);
    assert.ok(timeoutOk(job), `${name}: timeout-minutes עד 30`);
  }
});
test("test", () => {
  const job = wf.jobs.test;
  const s = steps(job);
  assert.match(s[0]?.uses ?? "", /^actions\/checkout@v\d+$/);
  const node = s.find((x) => /^actions\/setup-node@v\d+$/.test(x.uses ?? ""));
  assert.equal(String(node?.with?.["node-version"]), "24");
  assert.equal(node?.with?.cache, "npm");
  const ci = stepIndex(job, /^npm ci$/);
  assert.ok(ci > 0 && stepIndex(job, /^npm test$/) > ci, "npm ci ואז npm test");
  assert.equal(job.needs, undefined, "test בלי needs — במקביל");
});
test("docker", () => {
  const job = wf.jobs.docker;
  assert.match(steps(job)[0]?.uses ?? "", /^actions\/checkout@v\d+$/);
  assert.ok(stepIndex(job, /^docker build -t tasks-api:ci \.$/) > 0, "docker build -t tasks-api:ci .");
  assert.equal(job.needs, undefined, "docker בלי needs — במקביל");
});
test("deploy — needs ו־if", () => {
  const job = wf.jobs.deploy;
  assert.deepEqual([job.needs].flat().sort(), ["docker", "test"], "needs: [test, docker]");
  const cond = String(job.if ?? "").replace(/\$\{\{|\}\}/g, "").replace(/\s+/g, " ").trim();
  assert.match(cond, /github\.event_name == 'push'/);
  assert.match(cond, /github\.ref == 'refs\/heads\/main'/);
  assert.match(cond, /&&/);
  assert.ok(stepIndex(job, /^echo ["']?deploy["']?$/) >= 0, 'echo "deploy"');
});
