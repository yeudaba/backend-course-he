import { test } from "node:test";
import assert from "node:assert/strict";
import { readWorkflow, steps } from "./_workflow.mjs";

const { wf, on } = readWorkflow(import.meta.url, "P25-E20.yml");

test("הסוד של הפרודקשן — לא בבדיקות", () => {
  assert.ok(!/secrets\./.test(JSON.stringify(wf.env ?? {})), "בלי secrets ב־env של כל ה־workflow");
  assert.ok(!/secrets\./.test(JSON.stringify(wf.jobs.test)), "ה־test job לא רואה secrets");
  const url = wf.jobs.test.env?.DATABASE_URL ?? "";
  assert.match(url, /localhost/, "ל־test job — מסד מקומי (שירות postgres)");
  assert.ok(wf.jobs.test.services, "services: postgres");
  const migrate = steps(wf.jobs.deploy).find((s) => /migrate deploy/.test(s.run ?? ""));
  assert.match(JSON.stringify(migrate?.env ?? wf.jobs.deploy.env ?? {}), /secrets\.DATABASE_URL/, "deploy עדיין מריץ migrations על הפרודקשן");
});
test("deploy אחרי הבדיקות", () => {
  assert.ok([wf.jobs.deploy.needs].flat().includes("test"), "needs: test");
});
test("deploy רק מ־main", () => {
  const cond = String(wf.jobs.deploy.if ?? "");
  const onlyMain = /refs\/heads\/main/.test(cond) && /push/.test(cond);
  const triggersOnlyMainPush = on && !Array.isArray(on) && !on.pull_request && [on.push?.branches].flat().join() === "main";
  assert.ok(onlyMain || triggersOnlyMainPush, "if: github.event_name == 'push' && github.ref == 'refs/heads/main'");
});
