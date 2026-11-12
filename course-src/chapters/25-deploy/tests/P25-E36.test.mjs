import { test } from "node:test";
import assert from "node:assert/strict";
import { exportsOf } from "./_ts.mjs";

const get = async () => (await exportsOf(import.meta.url, "P25-E36.ts", ["shouldTrigger"])).shouldTrigger;
const ev = (name, branch) => ({ name, branch });

test("מחרוזת ומערך", async () => {
  const f = await get();
  assert.equal(f("push", ev("push", "anything")), true);
  assert.equal(f("push", ev("pull_request", "main")), false);
  assert.equal(f(["push", "pull_request"], ev("pull_request", "x")), true);
  assert.equal(f(["push"], ev("workflow_dispatch", "main")), false);
});
test("אובייקט עם branches", async () => {
  const f = await get();
  const on = { push: { branches: ["main"] }, pull_request: { branches: ["main"] }, workflow_dispatch: null };
  assert.equal(f(on, ev("push", "main")), true);
  assert.equal(f(on, ev("push", "feature/login")), false);
  assert.equal(f(on, ev("pull_request", "main")), true);
  assert.equal(f(on, ev("workflow_dispatch", "whatever")), true, "null ← כל branch");
  assert.equal(f(on, ev("schedule", "main")), false);
  assert.equal(f({ push: {} }, ev("push", "x")), true);
});
test("דפוסים: * ו־**", async () => {
  const f = await get();
  const on = { push: { branches: ["release/*", "hotfix/**", "v1.0"] } };
  assert.equal(f(on, ev("push", "release/1.2")), true);
  assert.equal(f(on, ev("push", "release/1/2")), false, "* לא עובר /");
  assert.equal(f(on, ev("push", "hotfix/a/b/c")), true, "** עובר /");
  assert.equal(f(on, ev("push", "v1.0")), true);
  assert.equal(f(on, ev("push", "v1x0")), false, "נקודה היא נקודה");
  assert.equal(f(on, ev("push", "xrelease/1")), false, "מתחילת השם");
  assert.equal(f({ push: { branches: ["*-fix"] } }, ev("push", "login-fix")), true);
});
test("branches-ignore", async () => {
  const f = await get();
  const on = { push: { "branches-ignore": ["dependabot/**", "wip-*"] } };
  assert.equal(f(on, ev("push", "main")), true);
  assert.equal(f(on, ev("push", "dependabot/npm/express-5")), false);
  assert.equal(f(on, ev("push", "wip-login")), false);
});
