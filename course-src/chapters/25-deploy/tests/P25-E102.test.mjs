import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, stepIndex, steps } from "./_workflow.mjs";

const read = () => readWorkflow(import.meta.url, "P25-E102.yml");

test("רץ על push ל־main ועל pull request", () => {
  const { on } = read();
  assert.ok(on && typeof on === "object", "on: עם push ו־pull_request");
  assert.ok(on.push?.branches?.includes("main"), "push ל־main");
  assert.ok("pull_request" in on, "חסר pull_request — על PR לא רץ כלום");
});
test("checkout לפני setup-node", () => {
  const job = read().wf.jobs.test;
  const co = stepIndex(job, /actions\/checkout@/);
  const node = stepIndex(job, /actions\/setup-node@/);
  assert.ok(co >= 0 && node >= 0, "checkout ו־setup-node");
  assert.ok(co < node, "setup-node עם cache: npm צריך את package-lock.json — קודם checkout");
  assert.equal(steps(job)[node].with?.cache, "npm", "cache: npm נשאר");
});
test("npm ci ואז npm test", () => {
  const job = read().wf.jobs.test;
  const ci = stepIndex(job, /^npm ci\b/);
  assert.ok(ci >= 0, "npm ci — מתקין בדיוק את מה שב־lockfile");
  assert.equal(stepIndex(job, /^npm install\b/), -1, "npm install ב־CI יכול להתקין גרסאות אחרות");
  assert.ok(stepIndex(job, /^npm test\b/) > ci, "npm test אחרי ההתקנה");
});
