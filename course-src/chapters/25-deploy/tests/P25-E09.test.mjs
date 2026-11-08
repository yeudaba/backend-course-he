import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, steps, stepIndex } from "./_workflow.mjs";

const { wf, on } = readWorkflow(import.meta.url, "P25-E09.yml");
const job = Object.values(wf.jobs)[0];

test("מתי רץ", () => {
  assert.deepEqual([on?.push?.branches].flat(), ["main"], "push ל־main");
  assert.deepEqual([on?.pull_request?.branches].flat(), ["main"], "pull_request ל־main");
});
test("הרשאות ומגבלת זמן", () => {
  assert.deepEqual(wf.permissions, { contents: "read" });
  assert.equal(Object.keys(wf.jobs).length, 1, "job אחד");
  assert.equal(job["runs-on"], "ubuntu-latest");
  assert.ok(Number(job["timeout-minutes"]) > 0 && Number(job["timeout-minutes"]) <= 30, "timeout-minutes (ברירת המחדל: 6 שעות!)");
});
test("הצעדים, בסדר", () => {
  const s = steps(job);
  assert.match(s[0]?.uses ?? "", /^actions\/checkout@v\d+$/, "ראשון: checkout");
  const node = s.find((x) => /^actions\/setup-node@v\d+$/.test(x.uses ?? ""));
  assert.ok(node, "setup-node");
  assert.equal(String(node.with?.["node-version"]), "24");
  assert.equal(node.with?.cache, "npm", "cache: npm — npm ci מהיר בריצות הבאות");
  const ci = stepIndex(job, /^npm ci$/);
  const t = stepIndex(job, /^npm test$/);
  assert.ok(ci > 0 && t > ci, "npm ci ואז npm test");
  assert.ok(s.every((x) => !/npm install/.test(x.run ?? "")), "לא npm install");
});
